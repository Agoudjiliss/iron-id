"""
IronID — API Keys Router.

Endpoints:
  POST   /v1/keys          Create a new API key
  GET    /v1/keys          List all API keys for the current user
  DELETE /v1/keys/{id}     Revoke an API key
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from middleware.auth import get_current_user, get_current_user_from_session
from models.api_key import APIKey
from models.user import User
from services.api_key_service import (
    create_api_key,
    list_user_keys,
    revoke_api_key,
)

router = APIRouter(prefix="/v1/keys", tags=["API Keys"])


# --- Schemas ---

class CreateKeyRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Human-readable label for this key")
    environment: str = Field("production", pattern="^(production|test)$")


class APIKeyResponse(BaseModel):
    id: uuid.UUID
    name: str
    key_prefix: str
    is_active: bool
    created_at: str
    last_used_at: str | None

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_key(cls, key: APIKey) -> "APIKeyResponse":
        return cls(
            id=key.id,
            name=key.name,
            key_prefix=key.key_prefix,
            is_active=key.is_active,
            created_at=key.created_at.isoformat(),
            last_used_at=key.last_used_at.isoformat() if key.last_used_at else None,
        )


class CreateKeyResponse(APIKeyResponse):
    """Includes raw key — only returned once at creation time."""
    raw_key: str


# --- Routes ---

@router.post(
    "",
    response_model=CreateKeyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new API key",
)
async def create_key(
    body: CreateKeyRequest,
    user: User = Depends(get_current_user_from_session),
    db: AsyncSession = Depends(get_db),
) -> CreateKeyResponse:
    """
    Generate a new API key for the authenticated user.
    The raw key is returned once — store it securely; it cannot be retrieved again.
    """
    is_prod = body.environment == "production"

    api_key, raw_key = await create_api_key(db, user.id, body.name, is_prod)

    return CreateKeyResponse(
        id=api_key.id,
        name=api_key.name,
        key_prefix=api_key.key_prefix,
        is_active=api_key.is_active,
        created_at=api_key.created_at.isoformat(),
        last_used_at=None,
        raw_key=raw_key,
    )


@router.get(
    "",
    response_model=list[APIKeyResponse],
    summary="List all API keys",
)
async def list_keys(
    user: User = Depends(get_current_user_from_session),
    db: AsyncSession = Depends(get_db),
) -> list[APIKeyResponse]:
    """Return all API keys belonging to the authenticated user."""
    keys = await list_user_keys(db, user.id)
    return [APIKeyResponse.from_orm_key(k) for k in keys]


@router.delete(
    "/{key_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Revoke an API key",
)
async def revoke_key(
    key_id: uuid.UUID,
    user: User = Depends(get_current_user_from_session),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Revoke (deactivate) an API key. This action is irreversible."""
    revoked = await revoke_api_key(db, key_id, user.id)
    if not revoked:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "API key not found.", "code": "NOT_FOUND"},
        )
