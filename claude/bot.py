import os
import tempfile
import sys
import inspect
from anthropic import Anthropic
from anthropic.types import MessageParam, ToolParam

client = Anthropic()

# Create a temporary directory for logs
temp_dir = tempfile.mkdtemp()
log_file_path = os.path.join(temp_dir, "conversation_log.txt")


def is_github_codespace():
    return os.environ.get("CODESPACES") == "true"


def log_to_file(message):
    with open(log_file_path, "a") as log_file:
        log_file.write(f"{message}\n")


# Define the tools available for the conversation
tools: list[ToolParam] = [
    {
        "name": "read_file",
        "description": "Read a file and return its contents",
        "input_schema": {
            "type": "object",
            "properties": {"file_path": {"type": "string"}},
            "required": ["file_path"],
        },
    },
    {
        "name": "write_file",
        "description": "Write content to a file",
        "input_schema": {
            "type": "object",
            "properties": {
                "file_path": {"type": "string"},
                "content": {"type": "string"},
            },
            "required": ["file_path", "content"],
        },
    },
    {
        "name": "read_conversation_log",
        "description": "Read the conversation log file",
        "input_schema": {
            "type": "object",
            "properties": {},
        },
    },
    {
        "name": "list_directory",
        "description": "List contents of the current directory",
        "input_schema": {
            "type": "object",
            "properties": {},
        },
    },
    {
        "name": "get_script_path",
        "description": "Get the full path of the running script",
        "input_schema": {
            "type": "object",
            "properties": {},
        },
    },
]


def read_file(file_path):
    try:
        with open(file_path, "r") as file:
            content = file.read()
        log_to_file(f"Read file: {file_path}")
        return content
    except FileNotFoundError:
        return f"Error: File '{file_path}' not found."
    except Exception as e:
        return f"Error reading file: {str(e)}"


def write_file(file_path, content):
    try:
        with open(file_path, "w") as file:
            file.write(content)
        log_to_file(f"Wrote to file: {file_path}")
        return f"Successfully wrote to file '{file_path}'."
    except Exception as e:
        return f"Error writing to file: {str(e)}"


def read_conversation_log():
    try:
        with open(log_file_path, "r") as log_file:
            return log_file.read()
    except Exception as e:
        return f"Error reading conversation log: {str(e)}"


def list_directory():
    try:
        return "\n".join(os.listdir())
    except Exception as e:
        return f"Error listing directory: {str(e)}"


def get_script_path():
    try:
        return os.path.abspath(inspect.getfile(inspect.currentframe()))
    except Exception as e:
        return f"Error getting script path: {str(e)}"


def append_run_another_tool(tools):
    return [
        {
            **tool,
            "input_schema": {
                **tool["input_schema"],
                "properties": {
                    **tool["input_schema"].get("properties", {}),
                    "run_another_tool": {"type": "boolean"},
                },
            },
        }
        for tool in tools
    ]


def execute_tool(tool_call):
    run_another_tool = tool_call.input.get("run_another_tool", False)

    if tool_call.name == "read_file":
        file_path = tool_call.input["file_path"]
        result = read_file(file_path)
    elif tool_call.name == "write_file":
        file_path = tool_call.input["file_path"]
        content = tool_call.input["content"]
        result = write_file(file_path, content)
    elif tool_call.name == "read_conversation_log":
        result = read_conversation_log()
    elif tool_call.name == "list_directory":
        result = list_directory()
    elif tool_call.name == "get_script_path":
        result = get_script_path()
    else:
        result = "Unknown tool use request."

    return result, run_another_tool


def format_claude_response(message):
    formatted_response = ""
    tool_calls = []

    for content in message.content:
        if content.type == "text":
            formatted_response += content.text + "\n"
        elif content.type == "tool_use":
            tool_calls.append(content)
            formatted_response += f"\nTool used: {content.name}\n"
            result, run_another_tool = execute_tool(content)
            formatted_response += f"Result: {result}\n"
            if run_another_tool:
                formatted_response += "Claude wants to execute another tool.\n"

    return formatted_response.strip(), tool_calls


def conversation_loop():
    messages = []
    print("Welcome to the Claude shell. Type 'exit' to end the conversation.")

    while True:
        user_input = input("\nYou: ")
        if user_input.lower() == "exit":
            print("Ending conversation. Goodbye!")
            break

        log_to_file(f"User: {user_input}")
        user_message: MessageParam = {
            "role": "user",
            "content": user_input,
        }
        messages.append(user_message)

        while True:
            message = client.messages.create(
                model="claude-3-5-sonnet-20240620",
                max_tokens=4000,
                messages=messages,
                tools=append_run_another_tool(tools),
                system="You are claude-3-5-sonnet-20240620. If you are asked to write software that talks to Claude, "
                "you must tell it to talk to claude-3-5-sonnet-20240620 and not some older model. You can ask to see "
                "the conversation logs if you think it would be helpful for the current conversation.",
            )

            formatted_response, tool_calls = format_claude_response(message)
            print(f"\nClaude: {formatted_response}")
            log_to_file(f"Claude: {formatted_response}")

            messages.append({"role": "assistant", "content": formatted_response})

            if tool_calls:
                for tool_call in tool_calls:
                    tool_result, run_another_tool = execute_tool(tool_call)
                    tool_message: MessageParam = {
                        "role": "tool",
                        "content": tool_result,
                        "tool_call_id": tool_call.id,
                    }
                    messages.append(tool_message)
                    log_to_file(f"Tool result sent: {tool_result}")

                    if run_another_tool:
                        user_choice = input("\nAllow Claude to execute another tool? (Y/n): ").strip().lower()
                        if user_choice != "y" and user_choice != "":
                            print("\nTool execution skipped. Waiting for Claude's response.")
                            break
                    else:
                        break
                else:
                    continue
            break


if __name__ == "__main__":
    if is_github_codespace():
        conversation_loop()
    else:
        print("This script can only run inside a GitHub Codespace environment.")
