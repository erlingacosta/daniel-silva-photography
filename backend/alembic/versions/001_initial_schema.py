"""Initial schema creation

Revision ID: 001
Revises: 
Create Date: 2026-04-07 18:45:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create UUID extension
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('username', sa.String(), nullable=True),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default=sa.true()),
        sa.Column('is_admin', sa.Boolean(), nullable=True, server_default=sa.false()),
        sa.Column('role', sa.String(), nullable=True, server_default='user'),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)
    
    # Create portfolios table
    op.create_table(
        'portfolios',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(), nullable=True),
        sa.Column('image_url', sa.String(), nullable=True),
        sa.Column('thumbnail_url', sa.String(), nullable=True),
        sa.Column('order', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_portfolios_title'), 'portfolios', ['title'], unique=False)
    
    # Create testimonials table
    op.create_table(
        'testimonials',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('client_name', sa.String(), nullable=True),
        sa.Column('event_type', sa.String(), nullable=True),
        sa.Column('quote', sa.Text(), nullable=True),
        sa.Column('rating', sa.Float(), nullable=True),
        sa.Column('image_url', sa.String(), nullable=True),
        sa.Column('order', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create service_packages table
    op.create_table(
        'service_packages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.Float(), nullable=True),
        sa.Column('deliverables', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_service_packages_name'), 'service_packages', ['name'], unique=False)
    
    # Create bookings table
    op.create_table(
        'bookings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('client_id', sa.Integer(), nullable=True),
        sa.Column('package_id', sa.Integer(), nullable=True),
        sa.Column('event_date', sa.DateTime(), nullable=True),
        sa.Column('event_type', sa.String(), nullable=True),
        sa.Column('event_location', sa.String(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('status', sa.String(), nullable=True, server_default='pending'),
        sa.Column('total_price', sa.Float(), nullable=True),
        sa.Column('deposit_paid', sa.Boolean(), nullable=True, server_default=sa.false()),
        sa.Column('payment_intent_id', sa.String(), nullable=True),
        sa.Column('deliverables_ready', sa.Boolean(), nullable=True, server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=True, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['client_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['package_id'], ['service_packages.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create inquiries table
    op.create_table(
        'inquiries',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('sender_id', sa.Integer(), nullable=True),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('phone', sa.String(), nullable=True),
        sa.Column('event_type', sa.String(), nullable=True),
        sa.Column('event_date', sa.String(), nullable=True),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('status', sa.String(), nullable=True, server_default='new'),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['sender_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create invoices table
    op.create_table(
        'invoices',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('booking_id', sa.Integer(), nullable=True),
        sa.Column('invoice_number', sa.String(), nullable=True),
        sa.Column('amount', sa.Float(), nullable=True),
        sa.Column('status', sa.String(), nullable=True, server_default='draft'),
        sa.Column('due_date', sa.DateTime(), nullable=True),
        sa.Column('paid_date', sa.DateTime(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=True, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_invoices_invoice_number'), 'invoices', ['invoice_number'], unique=True)
    
    # Create newsletter_subscribers table
    op.create_table(
        'newsletter_subscribers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('subscribed_at', sa.DateTime(), nullable=True, server_default=sa.func.now()),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default=sa.true()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_newsletter_subscribers_email'), 'newsletter_subscribers', ['email'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_newsletter_subscribers_email'), table_name='newsletter_subscribers')
    op.drop_table('newsletter_subscribers')
    op.drop_index(op.f('ix_invoices_invoice_number'), table_name='invoices')
    op.drop_table('invoices')
    op.drop_table('inquiries')
    op.drop_table('bookings')
    op.drop_index(op.f('ix_service_packages_name'), table_name='service_packages')
    op.drop_table('service_packages')
    op.drop_table('testimonials')
    op.drop_index(op.f('ix_portfolios_title'), table_name='portfolios')
    op.drop_table('portfolios')
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
