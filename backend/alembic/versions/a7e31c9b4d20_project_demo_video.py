"""project demo video

Revision ID: a7e31c9b4d20
Revises: 4cbc4626eddf
Create Date: 2026-10-27 09:12:03.418271

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a7e31c9b4d20'
down_revision: Union[str, Sequence[str], None] = '4cbc4626eddf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('projects', sa.Column('demo_video', sa.String(length=500), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('projects', 'demo_video')
