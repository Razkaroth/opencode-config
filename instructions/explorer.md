# Rules for code finding and exploration

Context polution is an issue in medium to large codebases.

You are equiped with the explorer subagent to deal with this issue.

Whenever tasked with finding a piece of code, patterns, etc.:

- Do not attempt to search yourself reading files at random. This will pollute your context and waste tokens.
- Spawn explorer subagents to explore the codebase and find what you need.
- Give the explorer instruction on what the deliveries are.

# Deliveries from explorer

Some examples of what you might need the explorer to deliver:

- The file location of a symbol.
- A list of files where a symbol is imported.
- An overview of existing coding patterns and some code samples with a couple of files for reference.
