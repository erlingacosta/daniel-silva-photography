import boto3
from fastapi import UploadFile, HTTPException
from botocore.config import Config
from config import settings
import traceback

def get_spaces_client():
    """Initialize Spaces S3 client with error checking"""
    try:
        if not settings.DO_SPACES_KEY or not settings.DO_SPACES_SECRET:
            raise ValueError("DO_SPACES_KEY or DO_SPACES_SECRET not configured in environment")
        
        client = boto3.client(
            's3',
            region_name=settings.DO_SPACES_REGION,
            endpoint_url=settings.DO_SPACES_ENDPOINT,
            aws_access_key_id=settings.DO_SPACES_KEY,
            aws_secret_access_key=settings.DO_SPACES_SECRET,
            config=Config(s3={'addressing_style': 'virtual'})
        )
        print(f"✅ Spaces client initialized - Region: {settings.DO_SPACES_REGION}, Bucket: {settings.DO_SPACES_BUCKET}")
        return client
    except Exception as e:
        print(f"❌ Failed to initialize Spaces client: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Spaces configuration error: {str(e)}")

async def upload_to_spaces(file: UploadFile, folder: str = 'images') -> str:
    """Upload file to DigitalOcean Spaces"""
    try:
        print(f"📤 Starting upload: {file.filename}")
        
        # Validate credentials
        if not settings.DO_SPACES_KEY:
            raise ValueError("DO_SPACES_KEY is not set")
        if not settings.DO_SPACES_SECRET:
            raise ValueError("DO_SPACES_SECRET is not set")
        
        client = get_spaces_client()
        bucket = settings.DO_SPACES_BUCKET
        
        print(f"📁 Using bucket: {bucket}")
        
        file_key = f"{folder}/{file.filename}"
        print(f"🔑 File key: {file_key}")
        
        file_content = await file.read()
        print(f"📊 File size: {len(file_content)} bytes")
        
        # Upload to Spaces
        client.put_object(
            Bucket=bucket,
            Key=file_key,
            Body=file_content,
            ACL='public-read',
            ContentType=file.content_type or 'application/octet-stream'
        )
        
        url = f"{settings.DO_SPACES_ENDPOINT}/{bucket}/{file_key}"
        print(f"✅ Upload successful: {url}")
        return url
        
    except ValueError as e:
        print(f"❌ Configuration error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Configuration error: {str(e)}")
    except Exception as e:
        print(f"❌ Upload failed: {type(e).__name__}: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
