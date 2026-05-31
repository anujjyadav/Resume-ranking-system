"""
Run this script once before starting the server to pre-compute
and cache the SBERT embeddings for all job roles.

Usage:
    python precompute_embeddings.py
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from core.recommender import precompute_role_embeddings

if __name__ == "__main__":
    print("=" * 50)
    print(" Pre-computing Job Role Embeddings")
    print("=" * 50)
    embeddings, role_ids = precompute_role_embeddings()
    print(f"\nDone! Computed {len(role_ids)} role embeddings.")
    print(f"   Shape: {embeddings.shape}")
    print("   You can now start the server with: uvicorn main:app --reload")
