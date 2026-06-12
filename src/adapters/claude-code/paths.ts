import { homedir } from "node:os";
import { join } from "node:path";

export interface ClaudeCodePaths {
  homeDir: string;
  configDir: string;
  settingsFile: string;
  claudeJsonFile: string;
  skillsDir: string;
  pluginsCacheDir: string;
  rulesDir: string;
  rootClaudeMd: string;
}

export function resolvePaths(homeDirOverride?: string): ClaudeCodePaths {
  const homeDir = homeDirOverride ?? homedir();
  const configDir = join(homeDir, ".claude");
  return {
    homeDir,
    configDir,
    settingsFile: join(configDir, "settings.json"),
    claudeJsonFile: join(homeDir, ".claude.json"),
    skillsDir: join(configDir, "skills"),
    pluginsCacheDir: join(configDir, "plugins", "cache"),
    rulesDir: join(configDir, "rules"),
    rootClaudeMd: join(configDir, "CLAUDE.md"),
  };
}
