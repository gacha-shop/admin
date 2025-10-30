# Supabase MCP Server Setup

This document explains how to set up and use the Supabase MCP (Model Context Protocol) server in this project.

## What is MCP?

MCP (Model Context Protocol) allows Claude Code to interact with external services and databases through standardized server integrations.

## Configuration Files

### 1. `.env.local` - Environment Variables

Contains your Supabase credentials:

```env
SUPABASE_PROJECT_REF=kabndipxpxxhwqljhsdv
SUPABASE_ANON_KEY=your-anon-key-here
```

**Note**: This file is already in `.gitignore` to protect your credentials.

### 2. `.claude/mcp.json` - MCP Server Configuration

Defines the Supabase MCP server connection:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "https://kabndipxpxxhwqljhsdv.supabase.co",
        "SUPABASE_KEY": "your-anon-key-here"
      }
    }
  }
}
```

**Note**: This file is also in `.gitignore` for security.

## Supabase MCP Capabilities

Once connected, Claude Code can:

- **Query database tables** - Read data from your Supabase database
- **Execute SQL queries** - Run custom SQL commands
- **Manage database schema** - View and modify table structures
- **Access storage** - Interact with Supabase Storage buckets
- **Call Edge Functions** - Execute Supabase Edge Functions

## Usage

After configuration, Claude Code will automatically connect to your Supabase instance. You can ask Claude Code to:

- "Show me all tables in the database"
- "Query the users table"
- "Create a new table for products"
- "Insert data into the inventory table"
- "Run this SQL query: SELECT * FROM orders WHERE status = 'pending'"

## Troubleshooting

### Connection Issues

If Claude Code cannot connect to Supabase:

1. Verify your `SUPABASE_URL` is correct (format: `https://{project-ref}.supabase.co`)
2. Check that your `SUPABASE_KEY` is valid (use anon key for client-side, service_role key for admin operations)
3. Ensure your Supabase project is active and not paused

### Permission Errors

If you get permission errors:

- Anon key has limited permissions based on RLS (Row Level Security) policies
- Consider using `SUPABASE_SERVICE_ROLE_KEY` for admin operations (but keep it secure!)
- Review your RLS policies in Supabase Dashboard

### MCP Server Not Loading

1. Restart Claude Code to reload the configuration
2. Check that `npx` is available in your PATH
3. Verify the MCP server package can be downloaded: `npx -y @modelcontextprotocol/server-supabase --help`

## Security Best Practices

1. **Never commit** `.env.local` or `.claude/mcp.json` with real credentials
2. Use **anon key** for client-side operations
3. Keep **service_role key** secure and only use when necessary
4. Enable **RLS policies** on all tables in production
5. Regularly **rotate API keys** in Supabase Dashboard

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [MCP Protocol Specification](https://github.com/modelcontextprotocol)
- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code)

## Project Information

- **Supabase Project URL**: https://kabndipxpxxhwqljhsdv.supabase.co
- **Project Dashboard**: https://supabase.com/dashboard/project/kabndipxpxxhwqljhsdv
