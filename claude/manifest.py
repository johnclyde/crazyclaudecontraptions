import json
from dataclasses import dataclass


@dataclass
class Manifest:
    files: list[dict[str, str]]
    rules: list[dict[str, str]]

    @classmethod
    def load_from_file(cls, filename="manifest.json") -> "Manifest":
        with open(filename, "r") as f:
            data = json.load(f)
            files = data.get("files", [])
            rules = data.get("rules", [])
        return Manifest(files, rules)

    def save_to_file(self, filename="manifest.json") -> None:
        with open(filename, "w") as f:
            json.dump(self.__dict__, f, indent=2)
