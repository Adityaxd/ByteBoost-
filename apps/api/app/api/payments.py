from fastapi import APIRouter, Request, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
import hmac
import hashlib
import httpx
from typing import Optional, Dict, Any

from app.core.config import settings
from app.db.database import get_db
from app.schemas import OrderCreate, OrderInDB, PaymentInDB, RazorpayWebhookEvent

router = APIRouter()


@router.post("/razorpay/orders", response_model=OrderInDB)
async def create_razorpay_order(
    order: OrderCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a Razorpay order for course purchase
    """
    # TODO: Implement Razorpay order creation
    # 1. Create order in database
    # 2. Call Razorpay API to create order
    # 3. Return order details
    return {"message": "Razorpay order creation - to be implemented"}


@router.post("/razorpay/webhook")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Handle Razorpay webhook events
    """
    # TODO: Implement webhook handling
    # 1. Verify webhook signature
    # 2. Process payment event
    # 3. Update order and enrollment status
    
    body = await request.body()
    
    # Verify signature
    if x_razorpay_signature:
        secret = settings.RAZORPAY_WEBHOOK_SECRET.encode()
        expected_signature = hmac.new(
            secret,
            body,
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(expected_signature, x_razorpay_signature):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid webhook signature"
            )
    
    # TODO: Process webhook event
    return {"status": "ok"}


@router.post("/razorpay/verify")
async def verify_payment(
    payment_id: str,
    order_id: str,
    signature: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Verify Razorpay payment signature
    """
    # TODO: Implement payment verification
    # 1. Verify signature
    # 2. Update payment status
    # 3. Activate enrollment
    
    message = f"{order_id}|{payment_id}"
    secret = settings.RAZORPAY_KEY_SECRET.encode()
    expected_signature = hmac.new(
        secret,
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(expected_signature, signature):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment signature"
        )
    
    # TODO: Update payment and enrollment
    return {"verified": True}


@router.get("/orders", response_model=list[OrderInDB])
async def get_user_orders(
    db: AsyncSession = Depends(get_db)
):
    """
    Get all orders for the current user
    """
    # TODO: Implement order retrieval
    return []


@router.get("/orders/{order_id}", response_model=OrderInDB)
async def get_order(
    order_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get order details by ID
    """
    # TODO: Implement order retrieval
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Order not found"
    )


@router.post("/refund/{order_id}")
async def request_refund(
    order_id: int,
    reason: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Request refund for an order
    """
    # TODO: Implement refund request
    # 1. Validate refund eligibility
    # 2. Initiate refund with payment provider
    # 3. Update order and enrollment status
    return {"message": "Refund request - to be implemented"}