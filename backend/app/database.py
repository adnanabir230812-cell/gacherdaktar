import os
import json
from sqlalchemy import create_engine, Column, String, Float, Integer, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

DATABASE_URL = "sqlite:///./krishisathi.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class District(Base):
    __tablename__ = "districts"
    id = Column(Integer, primary_key=True, index=True)
    name_bn = Column(String, unique=True, index=True)
    name_en = Column(String, unique=True, index=True)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)

class Crop(Base):
    __tablename__ = "crops"
    id = Column(Integer, primary_key=True, index=True)
    name_bn = Column(String, unique=True, index=True)
    name_en = Column(String, index=True)
    scientific_name = Column(String, nullable=True)
    category = Column(String, index=True) # grain, vegetable, fruit, spice, flower, commercial
    seasons = Column(String) # JSON list: e.g., ["boro", "rabi"]
    soil_preference = Column(String) # JSON list: e.g., ["loam", "clay"]
    water_requirement = Column(String) # low, medium, high
    yield_avg = Column(Float) # ton per hectare
    profit_avg = Column(Float) # BDT per bigha
    icon_name = Column(String) # SVG name

    fertilizers = relationship("FertilizerRule", back_populates="crop", cascade="all, delete-orphan")
    diseases = relationship("Disease", back_populates="crop", cascade="all, delete-orphan")

class FertilizerRule(Base):
    __tablename__ = "fertilizer_rules"
    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"))
    season = Column(String, index=True)
    urea = Column(Float) # kg per bigha
    tsp = Column(Float) # kg per bigha
    mop = Column(Float) # kg per bigha
    gypsum = Column(Float) # kg per bigha
    zinc = Column(Float) # kg per bigha
    source_org = Column(String) # BRRI, BARI, DAE, etc.

    crop = relationship("Crop", back_populates="fertilizers")

class Disease(Base):
    __tablename__ = "diseases"
    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"))
    name_bn = Column(String, index=True)
    symptoms = Column(Text) # comma-separated BN keywords or description
    cause_bn = Column(Text)
    treatment_bn = Column(Text)
    prevention_bn = Column(Text)
    source_org = Column(String)

    crop = relationship("Crop", back_populates="diseases")

class KnowledgeEmbedding(Base):
    __tablename__ = "knowledge_embeddings"
    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=True)
    doc_type = Column(String) # brri_manual, bari_guide, dae_advisory
    content_snippet = Column(Text, nullable=False)
    embedding_json = Column(Text) # JSON list of 768 floats (or empty if offline)

class ChatHistory(Base):
    __tablename__ = "chat_history"
    id = Column(Integer, primary_key=True, index=True)
    query_bn = Column(Text, nullable=False)
    response_bn = Column(Text, nullable=False)
    confidence_score = Column(Float)
    sources = Column(Text) # comma-separated sources

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
