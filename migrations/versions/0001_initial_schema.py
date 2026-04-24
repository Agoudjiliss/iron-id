"""Initial IronID database schema.

Revision ID: 0001
Revises: —
Create Date: 2026-04-24
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ------------------------------------------------------------------
    # USERS
    # ------------------------------------------------------------------
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("clerk_id", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("plan", sa.String(50), nullable=False, server_default="free"),
        sa.Column("stripe_customer_id", sa.String(255), nullable=True),
        sa.Column("stripe_subscription_id", sa.String(255), nullable=True),
        sa.Column("affiliate_code", sa.String(20), nullable=True),
        sa.Column("referred_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("monthly_signatures_used", sa.Integer(), server_default="0"),
        sa.Column("monthly_signatures_limit", sa.Integer(), server_default="10"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
        sa.UniqueConstraint("clerk_id", name="uq_users_clerk_id"),
        sa.UniqueConstraint("email", name="uq_users_email"),
        sa.UniqueConstraint("affiliate_code", name="uq_users_affiliate_code"),
        sa.ForeignKeyConstraint(["referred_by"], ["users.id"], name="fk_users_referred_by"),
        sa.CheckConstraint(
            "plan IN ('free', 'payg', 'individual', 'studio', 'enterprise')",
            name="ck_users_plan",
        ),
    )

    # ------------------------------------------------------------------
    # API KEYS
    # ------------------------------------------------------------------
    op.create_table(
        "api_keys",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("key_hash", sa.String(255), nullable=False),
        sa.Column("key_prefix", sa.String(20), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("last_used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name="fk_api_keys_user_id", ondelete="CASCADE"
        ),
        sa.UniqueConstraint("key_hash", name="uq_api_keys_key_hash"),
    )

    # ------------------------------------------------------------------
    # CERTIFICATIONS
    # ------------------------------------------------------------------
    op.create_table(
        "certifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("api_key_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("file_hash_sha256", sa.String(64), nullable=False),
        sa.Column("file_name", sa.String(500), nullable=True),
        sa.Column("file_size_bytes", sa.BigInteger(), nullable=True),
        sa.Column("file_mime_type", sa.String(100), nullable=True),
        sa.Column("c2pa_manifest", postgresql.JSONB(), nullable=True),
        sa.Column("c2pa_signature", sa.String(500), nullable=True),
        sa.Column("certified_url", sa.Text(), nullable=True),
        sa.Column("status", sa.String(50), nullable=False, server_default="pending"),
        sa.Column("metadata", postgresql.JSONB(), server_default="{}"),
        sa.Column("webhook_url", sa.Text(), nullable=True),
        sa.Column("webhook_sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="fk_certifications_user_id"),
        sa.ForeignKeyConstraint(
            ["api_key_id"], ["api_keys.id"], name="fk_certifications_api_key_id"
        ),
        sa.CheckConstraint(
            "status IN ('pending', 'processing', 'certified', 'failed')",
            name="ck_certifications_status",
        ),
    )
    op.create_index("idx_certifications_hash", "certifications", ["file_hash_sha256"])

    # ------------------------------------------------------------------
    # LEDGER ENTRIES (append-only)
    # ------------------------------------------------------------------
    op.create_table(
        "ledger_entries",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("certification_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("file_hash_sha256", sa.String(64), nullable=False),
        sa.Column("event_type", sa.String(50), nullable=False),
        sa.Column("actor_ip", sa.String(45), nullable=True),
        sa.Column("actor_user_agent", sa.Text(), nullable=True),
        sa.Column("payload", postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
        sa.ForeignKeyConstraint(
            ["certification_id"], ["certifications.id"],
            name="fk_ledger_certification_id"
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="fk_ledger_user_id"),
        sa.CheckConstraint(
            "event_type IN ('certified', 'verified', 'revoked')",
            name="ck_ledger_event_type",
        ),
    )
    op.create_index("idx_ledger_hash", "ledger_entries", ["file_hash_sha256"])

    # Row-Level Security: block UPDATE and DELETE on ledger_entries
    op.execute("ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;")
    op.execute("""
        CREATE POLICY ledger_insert_only ON ledger_entries
            AS RESTRICTIVE
            FOR ALL
            USING (true)
            WITH CHECK (true);
    """)
    op.execute("""
        CREATE POLICY ledger_no_update ON ledger_entries
            AS RESTRICTIVE
            FOR UPDATE
            USING (false);
    """)
    op.execute("""
        CREATE POLICY ledger_no_delete ON ledger_entries
            AS RESTRICTIVE
            FOR DELETE
            USING (false);
    """)

    # ------------------------------------------------------------------
    # AFFILIATE COMMISSIONS
    # ------------------------------------------------------------------
    op.create_table(
        "affiliate_commissions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("affiliate_user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("referred_user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("stripe_payment_id", sa.String(255), nullable=True),
        sa.Column("amount_cents", sa.Integer(), nullable=False),
        sa.Column("commission_cents", sa.Integer(), nullable=False),
        sa.Column("commission_rate", sa.Numeric(4, 2), nullable=False),
        sa.Column("status", sa.String(50), nullable=False, server_default="pending"),
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
        sa.ForeignKeyConstraint(
            ["affiliate_user_id"], ["users.id"],
            name="fk_affiliate_commissions_affiliate_user_id"
        ),
        sa.ForeignKeyConstraint(
            ["referred_user_id"], ["users.id"],
            name="fk_affiliate_commissions_referred_user_id"
        ),
        sa.CheckConstraint(
            "status IN ('pending', 'paid', 'cancelled')",
            name="ck_affiliate_commissions_status",
        ),
    )

    # ------------------------------------------------------------------
    # WEBHOOK LOGS
    # ------------------------------------------------------------------
    op.create_table(
        "webhook_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("certification_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("url", sa.Text(), nullable=False),
        sa.Column("payload", postgresql.JSONB(), nullable=True),
        sa.Column("response_status", sa.Integer(), nullable=True),
        sa.Column("response_body", sa.Text(), nullable=True),
        sa.Column("attempt_count", sa.Integer(), server_default="1"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
        sa.ForeignKeyConstraint(
            ["certification_id"], ["certifications.id"],
            name="fk_webhook_logs_certification_id"
        ),
    )

    # ------------------------------------------------------------------
    # updated_at trigger for users table
    # ------------------------------------------------------------------
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)
    op.execute("""
        CREATE TRIGGER trg_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    """)


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS trg_users_updated_at ON users;")
    op.execute("DROP FUNCTION IF EXISTS update_updated_at;")
    op.drop_table("webhook_logs")
    op.drop_table("affiliate_commissions")
    op.execute("DROP POLICY IF EXISTS ledger_no_delete ON ledger_entries;")
    op.execute("DROP POLICY IF EXISTS ledger_no_update ON ledger_entries;")
    op.execute("DROP POLICY IF EXISTS ledger_insert_only ON ledger_entries;")
    op.drop_index("idx_ledger_hash", table_name="ledger_entries")
    op.drop_table("ledger_entries")
    op.drop_index("idx_certifications_hash", table_name="certifications")
    op.drop_table("certifications")
    op.drop_table("api_keys")
    op.drop_table("users")
