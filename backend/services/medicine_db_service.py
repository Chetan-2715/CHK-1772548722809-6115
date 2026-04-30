"""
Medicine Database Service — Kaggle Dataset Integration with Fuzzy Matching.

Pipeline:
  1. On startup, loads medicines.csv into memory (pandas DataFrame)
  2. fuzzy_match_medicine(name) — rapidfuzz to find best match (>85% confidence)
  3. add_to_local_dataset(data) — appends unknown medicines to the CSV
  4. Returns correct medicine name for use in Gemini prompts / DB lookups
"""
import os
import csv
import json
import logging
from typing import Optional, Dict, Any
from pathlib import Path

logger = logging.getLogger(__name__)

# ── Global datastore (loaded once on startup) ──────────────────────────────────
_medicines_df = None          # pandas DataFrame (when dataset exists)
_medicines_list = []          # list of dicts for fallback when pandas unavailable
_dataset_path = Path(r"d:\SVERI HACKATHON\data\medicines.csv")

# Columns we expect in the Kaggle CSV (case-insensitive mapped on load)
_COLUMN_MAP = {
    "drug name": "name",
    "medicine name": "name",
    "name": "name",
    "composition": "composition",
    "uses": "usage",
    "use(s)": "usage",
    "side effects": "side_effects",
    "manufacturer": "manufacturer",
    "manufacturer name": "manufacturer",
    "type": "domain",
}


def load_kaggle_dataset() -> int:
    """Load the Kaggle medicine CSV at startup. Returns number of records loaded."""
    global _medicines_df, _medicines_list

    if not _dataset_path.exists():
        logger.warning(
            f"⚠️  Medicine dataset not found at {_dataset_path}. "
            "Fuzzy matching disabled. Download from Kaggle and place at that path."
        )
        return 0

    try:
        import pandas as pd
        df = pd.read_csv(_dataset_path, encoding="utf-8", on_bad_lines="skip")

        # Normalise column names using the map
        col_rename = {}
        for col in df.columns:
            mapped = _COLUMN_MAP.get(col.strip().lower())
            if mapped:
                col_rename[col] = mapped
        df.rename(columns=col_rename, inplace=True)

        # Keep only the columns we care about
        keep = [c for c in ["name", "composition", "usage", "side_effects", "manufacturer", "domain"] if c in df.columns]
        df = df[keep].dropna(subset=["name"])
        df["name"] = df["name"].str.strip()

        _medicines_df = df
        _medicines_list = df.to_dict("records")
        logger.info(f"✅ Loaded {len(df)} medicines from Kaggle dataset")
        return len(df)

    except ImportError:
        logger.warning("pandas not installed — falling back to CSV reader for medicine dataset")
        return _load_csv_fallback()
    except Exception as e:
        logger.error(f"Failed to load medicine dataset: {e}")
        return 0


def _load_csv_fallback() -> int:
    """Simple CSV reader fallback when pandas is not available."""
    global _medicines_list
    try:
        with open(_dataset_path, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                mapped = {}
                for col, val in row.items():
                    key = _COLUMN_MAP.get(col.strip().lower())
                    if key:
                        mapped[key] = val.strip()
                if mapped.get("name"):
                    _medicines_list.append(mapped)
        logger.info(f"✅ Loaded {len(_medicines_list)} medicines (CSV fallback)")
        return len(_medicines_list)
    except Exception as e:
        logger.error(f"CSV fallback load failed: {e}")
        return 0


def fuzzy_match_medicine(raw_name: str, threshold: int = 80) -> Optional[Dict[str, Any]]:
    """
    Find the best matching medicine from the dataset using rapidfuzz.
    Returns the matched medicine dict (with normalised name) if confidence >= threshold,
    otherwise returns None so the caller can fall back to Gemini.
    """
    if not raw_name or not _medicines_list:
        return None

    try:
        from rapidfuzz import process, fuzz
        names = [m["name"] for m in _medicines_list]
        result = process.extractOne(
            raw_name,
            names,
            scorer=fuzz.WRatio,
            score_cutoff=threshold
        )
        if result:
            matched_name, score, idx = result
            medicine = dict(_medicines_list[idx])
            medicine["match_confidence"] = round(score, 1)
            medicine["original_query"] = raw_name
            logger.debug(f"Fuzzy match: '{raw_name}' → '{matched_name}' ({score:.1f}%)")
            return medicine
    except ImportError:
        # rapidfuzz not installed — try basic substring match
        raw_lower = raw_name.lower()
        for m in _medicines_list:
            if raw_lower in m["name"].lower() or m["name"].lower() in raw_lower:
                result = dict(m)
                result["match_confidence"] = 75.0
                result["original_query"] = raw_name
                return result
    except Exception as e:
        logger.error(f"Fuzzy match error: {e}")

    return None


def add_to_local_dataset(medicine_data: Dict[str, Any]) -> bool:
    """
    Append a newly discovered medicine to the local CSV dataset.
    Called when Gemini identifies a medicine NOT in the Kaggle dataset.
    """
    global _medicines_list, _medicines_df

    try:
        row = {
            "name": medicine_data.get("name", ""),
            "composition": medicine_data.get("composition", ""),
            "usage": medicine_data.get("usage", ""),
            "side_effects": medicine_data.get("side_effects", ""),
            "manufacturer": medicine_data.get("manufacturer", "Unknown"),
            "domain": medicine_data.get("domain", "allopathy"),
        }

        # Avoid duplicates
        if any(m["name"].lower() == row["name"].lower() for m in _medicines_list if m.get("name")):
            logger.debug(f"Medicine '{row['name']}' already in local dataset, skipping.")
            return False

        _medicines_list.append(row)

        # Write to CSV
        file_exists = _dataset_path.exists()
        with open(_dataset_path, "a", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["name", "composition", "usage", "side_effects", "manufacturer", "domain"])
            if not file_exists:
                writer.writeheader()
            writer.writerow(row)

        # Update pandas df if loaded
        if _medicines_df is not None:
            try:
                import pandas as pd
                _medicines_df = pd.concat([_medicines_df, pd.DataFrame([row])], ignore_index=True)
            except Exception:
                pass

        logger.info(f"✅ Added new medicine to local dataset: {row['name']}")
        return True

    except Exception as e:
        logger.error(f"Failed to add medicine to dataset: {e}")
        return False


def get_dataset_stats() -> Dict[str, Any]:
    """Returns info about the loaded dataset for admin/dashboard display."""
    return {
        "total_medicines": len(_medicines_list),
        "dataset_path": str(_dataset_path),
        "dataset_loaded": len(_medicines_list) > 0,
    }
