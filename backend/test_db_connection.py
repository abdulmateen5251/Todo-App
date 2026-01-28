"""Test PostgreSQL database connection."""
import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

load_dotenv()

async def test_connection():
    """Test database connection and query."""
    # Get database URL
    db_url = os.getenv("NEON_DATABASE_URL") or os.getenv("DATABASE_URL")
    
    if not db_url:
        print("❌ ERROR: No DATABASE_URL found in environment variables")
        return False
    
    print(f"📊 Database URL: {db_url[:40]}...")
    
    # Convert to asyncpg if needed
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        print(f"🔄 Converted to: {db_url[:40]}...")
    
    try:
        # Create engine
        print("\n🔌 Creating database engine...")
        engine = create_async_engine(db_url, echo=True)
        
        # Test connection
        print("\n🔍 Testing connection...")
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1 as test"))
            row = result.fetchone()
            print(f"✅ Connection successful! Test query result: {row}")
        
        # Check if tables exist
        print("\n📋 Checking for existing tables...")
        async with engine.connect() as conn:
            result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """))
            tables = result.fetchall()
            
            if tables:
                print("✅ Found tables:")
                for table in tables:
                    print(f"   - {table[0]}")
            else:
                print("⚠️  No tables found in database!")
        
        # Check users table
        print("\n👥 Checking users table...")
        async with engine.connect() as conn:
            try:
                result = await conn.execute(text("SELECT COUNT(*) FROM \"user\""))
                count = result.scalar()
                print(f"✅ Users table exists with {count} records")
            except Exception as e:
                print(f"⚠️  Users table check failed: {e}")
        
        # Check tasks table
        print("\n📝 Checking tasks table...")
        async with engine.connect() as conn:
            try:
                result = await conn.execute(text("SELECT COUNT(*) FROM task"))
                count = result.scalar()
                print(f"✅ Tasks table exists with {count} records")
            except Exception as e:
                print(f"⚠️  Tasks table check failed: {e}")
        
        await engine.dispose()
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_connection())
    exit(0 if success else 1)
