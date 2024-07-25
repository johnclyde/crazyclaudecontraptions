from abc import abstractmethod
from enum import Enum, auto


class MenuResult(Enum):
    CONTINUE = auto()
    EXIT = auto()
    TASK_COMPLETE = auto()


class MenuOption:
    def __init__(self, label: str) -> None:
        self.label = label

    @abstractmethod
    def run(self) -> MenuResult:
        pass


class Menu(MenuOption):
    def __init__(self, label: str) -> None:
        super().__init__(label)
        self.options: list[MenuOption] = []

    def add_option(self, option: MenuOption) -> None:
        self.options.append(option)

    def display(self) -> None:
        print(f"\n{self.label}")
        for index, option in enumerate(self.options, 1):
            print(f"{index}. {option.label}")
        print("0. Exit")

    def run(self) -> MenuResult:
        result = MenuResult.CONTINUE
        while result == MenuResult.CONTINUE:
            self.update_options()
            self.display()
            choice = int(input("Enter your choice: ")) - 1
            if choice == -1:
                return MenuResult.EXIT
            if 0 <= choice < len(self.options):
                result = self.options[choice].run()
            else:
                print("Invalid choice. Please try again.")

        return result

    @abstractmethod
    def update_options(self) -> None:
        pass
