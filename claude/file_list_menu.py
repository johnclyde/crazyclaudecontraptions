from dataclasses import dataclass

from menu import Menu
from sync_state import File, SyncManager


@dataclass
class FileListConfig:
    show_synced: bool = True
    show_local_only: bool = True
    show_remote_only: bool = True


class FileListMenu(Menu):
    def __init__(self, sync_manager: SyncManager) -> None:
        super().__init__("List All Files")
        self.sync_manager = sync_manager
        self.config = FileListConfig()

    def update_options(self) -> None:
        self.options.clear()
        self.add_option(ToggleSyncedFiles(self.config))
        self.add_option(ToggleLocalOnlyFiles(self.config))
        self.add_option(ToggleRemoteOnlyFiles(self.config))

    def run(self) -> None:
        self.display_files()
        super().run()

    def display_files(self) -> None:
        state = self.sync_manager.state
        print(f"{'Remote Path':<45} | {'UUID':<40} | Local Match | Full Path")
        print("-" * 10)

        for file in sorted(state.files.values(), key=lambda f: f.local_path):
            local_status = "✅" if file.local_present else "❌"
            remote_uuid = file.remote_uuid if file.remote_present else ""

            # Determine visibility of line based on toggle settings.
            visibility = False
            if file.local_present and file.remote_present:
                visibility = self.config.show_synced
            elif file.local_present and not file.remote_present:
                visibility = self.config.show_local_only
            elif not file.local_present and file.remote_present:
                visibility = self.config.show_remote_only

            if visibility:
                print(
                    f"{file.remote_path:<45} | {remote_uuid:<40} | {local_status:<11} | {file.local_path}"
                )


class ToggleSyncedFiles(Menu):
    def __init__(self, config: FileListConfig) -> None:
        self.config = config
        super().__init__(self.get_menu_title())

    def get_menu_title(self) -> str:
        return "Hide synced files" if self.config.show_synced else "Show synced files"

    def run(self) -> None:
        self.config.show_synced = not self.config.show_synced
        print(
            f"Synced files are now {'hidden' if not self.config.show_synced else 'visible'}"
        )
        self.name = self.get_menu_title()


class ToggleLocalOnlyFiles(Menu):
    def __init__(self, config: FileListConfig) -> None:
        self.config = config
        super().__init__(self.get_menu_title())

    def get_menu_title(self) -> str:
        return (
            "Hide local-only files"
            if self.config.show_local_only
            else "Show local-only files"
        )

    def run(self) -> None:
        self.config.show_local_only = not self.config.show_local_only
        print(
            f"Local-only files are now {'hidden' if not self.config.show_local_only else 'visible'}"
        )
        self.name = self.get_menu_title()


class ToggleRemoteOnlyFiles(Menu):
    def __init__(self, config: FileListConfig) -> None:
        self.config = config
        super().__init__(self.get_menu_title())

    def get_menu_title(self) -> str:
        return (
            "Hide remote-only files"
            if self.config.show_remote_only
            else "Show remote-only files"
        )

    def run(self) -> None:
        self.config.show_remote_only = not self.config.show_remote_only
        print(
            f"Remote-only files are now {'hidden' if not self.config.show_remote_only else 'visible'}"
        )
        self.name = self.get_menu_title()
