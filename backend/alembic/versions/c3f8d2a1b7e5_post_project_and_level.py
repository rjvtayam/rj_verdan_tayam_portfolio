"""post project and level

Revision ID: c3f8d2a1b7e5
Revises: a7e31c9b4d20
Create Date: 2026-10-27 14:05:11.284916

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3f8d2a1b7e5'
down_revision: Union[str, Sequence[str], None] = 'a7e31c9b4d20'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('posts', sa.Column('project_slug', sa.String(length=255), nullable=True))
    op.add_column('posts', sa.Column('level', sa.String(length=16), nullable=True))
    op.create_index(op.f('ix_posts_project_slug'), 'posts', ['project_slug'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_posts_project_slug'), table_name='posts')
    op.drop_column('posts', 'level')
    op.drop_column('posts', 'project_slug')
