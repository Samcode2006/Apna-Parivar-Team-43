"""
Encryption utility for securing family passwords
Uses PBKDF2 for key derivation and AES-256-GCM for encryption
"""

import os
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import secrets
import base64


class EncryptionService:
    """Service for encrypting and decrypting family passwords"""
    
    # Constants for encryption
    ALGORITHM = "AES-256-GCM"
    KEY_LENGTH = 32  # 256 bits
    SALT_LENGTH = 16
    NONCE_LENGTH = 12
    TAG_LENGTH = 16
    ITERATIONS = 480000  # PBKDF2 iterations (NIST recommendation)
    
    @staticmethod
    def derive_key(password: str, salt: bytes = None) -> tuple[str, str]:
        """
        Derive encryption key from admin password using PBKDF2
        
        Args:
            password: Admin password
            salt: Optional salt (generated if not provided)
        
        Returns:
            Tuple of (key_hex, salt_hex)
        """
        if salt is None:
            salt = secrets.token_bytes(EncryptionService.SALT_LENGTH)
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=EncryptionService.KEY_LENGTH,
            salt=salt,
            iterations=EncryptionService.ITERATIONS,
        )
        
        key = kdf.derive(password.encode())
        
        return base64.b64encode(key).decode(), base64.b64encode(salt).decode()
    
    @staticmethod
    def encrypt(family_password: str, admin_password: str) -> str:
        """
        Encrypt family password using admin password as key
        
        Args:
            family_password: The family password to encrypt
            admin_password: The admin's password (used as key derivation source)
        
        Returns:
            Encrypted data as base64 string in format: base64(nonce + ciphertext + tag)
        """
        try:
            # Generate random nonce
            nonce = secrets.token_bytes(EncryptionService.NONCE_LENGTH)
            
            # Generate temporary salt for key derivation
            temp_salt = secrets.token_bytes(EncryptionService.SALT_LENGTH)
            
            # Derive key from admin password
            key_hex, _ = EncryptionService.derive_key(admin_password, temp_salt)
            key = base64.b64decode(key_hex.encode())
            
            # Create cipher
            cipher = AESGCM(key)
            
            # Encrypt the family password
            ciphertext = cipher.encrypt(
                nonce,
                family_password.encode(),
                None  # No additional authenticated data
            )
            
            # Combine salt + nonce + ciphertext (ciphertext includes the GCM tag)
            encrypted_data = temp_salt + nonce + ciphertext
            
            # Return as base64 string for storage
            return base64.b64encode(encrypted_data).decode()
        
        except Exception as e:
            raise Exception(f"Encryption failed: {str(e)}")
    
    @staticmethod
    def decrypt(encrypted_data_b64: str, admin_password: str) -> str:
        """
        Decrypt family password using admin password
        
        Args:
            encrypted_data_b64: Encrypted data as base64 string
            admin_password: The admin's password (used as key derivation source)
        
        Returns:
            Decrypted family password
        """
        try:
            # Decode base64
            encrypted_data = base64.b64decode(encrypted_data_b64.encode())
            
            # Extract salt, nonce, and ciphertext
            salt = encrypted_data[:EncryptionService.SALT_LENGTH]
            nonce = encrypted_data[
                EncryptionService.SALT_LENGTH:
                EncryptionService.SALT_LENGTH + EncryptionService.NONCE_LENGTH
            ]
            ciphertext = encrypted_data[EncryptionService.SALT_LENGTH + EncryptionService.NONCE_LENGTH:]
            
            # Derive key from admin password using the stored salt
            key_hex, _ = EncryptionService.derive_key(admin_password, salt)
            key = base64.b64decode(key_hex.encode())
            
            # Create cipher
            cipher = AESGCM(key)
            
            # Decrypt
            plaintext = cipher.decrypt(nonce, ciphertext, None)
            
            return plaintext.decode()
        
        except Exception as e:
            raise Exception(f"Decryption failed: {str(e)}")


class PasswordHashingService:
    """Service for hashing passwords (for admin and family member login)"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """
        Hash password using PBKDF2 with random salt
        
        Args:
            password: Plain text password
        
        Returns:
            Hashed password as base64 string in format: base64(salt + hash)
        """
        try:
            salt = secrets.token_bytes(16)
            
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt,
                iterations=480000,
            )
            
            hash_value = kdf.derive(password.encode())
            
            # Combine salt + hash and encode as base64
            combined = salt + hash_value
            return base64.b64encode(combined).decode()
        
        except Exception as e:
            raise Exception(f"Password hashing failed: {str(e)}")
    
    @staticmethod
    def verify_password(password: str, hashed_password: str) -> bool:
        """
        Verify a password against its hash
        
        Args:
            password: Plain text password to verify
            hashed_password: The stored hashed password (base64)
        
        Returns:
            True if password matches, False otherwise
        """
        try:
            # Decode base64
            combined = base64.b64decode(hashed_password.encode())
            
            # Extract salt and stored hash
            salt = combined[:16]
            stored_hash = combined[16:]
            
            # Re-derive hash with the same salt
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt,
                iterations=480000,
            )
            
            hash_value = kdf.derive(password.encode())
            
            # Compare hashes
            return hash_value == stored_hash
        
        except Exception as e:
            raise Exception(f"Password verification failed: {str(e)}")
