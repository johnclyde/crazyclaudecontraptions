from dataclasses import dataclass, field


@dataclass
class File:
    path: str
    status: str = "unsynced"
    uuid: str = ""


@dataclass
class SyncState:
    local_files: list[File] = field(default_factory=list)
    remote_files: list[File] = field(default_factory=list)
    fetched: bool = False
