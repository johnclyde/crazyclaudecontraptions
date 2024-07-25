import difflib

from menu import Menu
from sync_state import File, SyncManager


class ViewFileDiffMenu(Menu):
    def __init__(self, sync_manager: SyncManager) -> None:
        super().__init__("View File Diff")
        self.sync_manager = sync_manager

    def update_options(self) -> None:
        self.options.clear()
        unsynced_files = [
            file
            for file in self.sync_manager.state.files.values()
            if not file.is_fully_synced
        ]
        for file in unsynced_files:
            self.add_option(ViewFileDiffOption(file, self.sync_manager))


class ViewFileDiffOption(Menu):
    def __init__(self, file: File, sync_manager: SyncManager) -> None:
        super().__init__(file.local_path)
        self.file = file
        self.sync_manager = sync_manager

    def run(self) -> None:
        self.display_file_diff()

    def display_file_diff(self) -> None:
        if not self.file.local_present:
            print(f"\nFile only exists remotely: {self.file.remote_path}")
            return

        if not self.file.remote_present:
            print(f"\nFile only exists locally: {self.file.local_path}")
            return

        local_lines = self.file.local_contents.splitlines(keepends=True)
        remote_lines = self.file.remote_contents.splitlines(keepends=True)

        diff = difflib.unified_diff(
            remote_lines,
            local_lines,
            fromfile=f"{self.file.remote_path} (remote)",
            tofile=f"{self.file.local_path} (local)",
            lineterm="",
        )

        print("\nFile diff:")
        print("".join(diff))
