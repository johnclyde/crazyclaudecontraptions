from dataclasses import dataclass

@dataclass
class Manifest:
    files: list[dict[str, str]]
    additional_local_directories: list[str]
    rules: list[dict[str, str]]

    @classmethod
    def load_from_file(cls, filename="manifest.json"):
        with open(filename, 'r') as f:
            data = json.load(f)
        return cls(**data)

    def save_to_file(self, filename="manifest.json"):
        with open(filename, 'w') as f:
            json.dump(self.__dict__, f, indent=2)
