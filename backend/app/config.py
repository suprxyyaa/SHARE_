from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    cloudinary_cloud_name: str
    cloudinary_api_key: str
    cloudinary_api_secret: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 120
    admin_email: str
    admin_password: str
    cors_origins: str = (
        "http://localhost:3000,https://share-chi-weld.vercel.app"
    )

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins_list(self) -> list[str]:
        origins = []
        for origin in self.cors_origins.split(","):
            cleaned = origin.strip().strip('"').strip("'")
            if cleaned:
                origins.append(cleaned)
        return origins


settings = Settings()