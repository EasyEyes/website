export type MediaRole = "admin" | "uploader" | "viewer";

export type MediaPermissions = {
  /** May add new media files. */
  upload: boolean;
  /** May edit descriptions and hide entries. Never replaces or deletes bytes,
   *  because a live phrase may already point at them. */
  manage: boolean;
};

export type MediaRoleAssignment = {
  username: string;
  role: MediaRole;
};

/** Netlify environment variable naming who may use the media library. */
export const ROLE_ENV_VAR = "MEDIA_ROLES";

const PERMISSIONS_BY_ROLE: Record<MediaRole, MediaPermissions> = {
  admin: { upload: true, manage: true },
  uploader: { upload: true, manage: false },
  viewer: { upload: false, manage: false },
};

const isMediaRole = (value: string): value is MediaRole =>
  Object.prototype.hasOwnProperty.call(PERMISSIONS_BY_ROLE, value);

/**
 * Reads the role list from the environment.
 *
 * Entries are separated by commas or newlines, and each is either a bare
 * username, which grants `uploader`, or `username:role` for anything else:
 *
 *   MEDIA_ROLES=denis:admin, yonathan, someone.else
 *
 * An entry naming an unknown role is dropped rather than guessed at, so a typo
 * costs that person their upload rights instead of granting more than intended.
 * An unset variable yields an empty list, which leaves everyone a viewer.
 */
export function loadRoleAssignments(
  raw: string | undefined = process.env[ROLE_ENV_VAR],
): ReadonlyArray<MediaRoleAssignment> {
  if (!raw) return [];

  return raw
    .split(/[,\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .flatMap<MediaRoleAssignment>((entry) => {
      const separator = entry.lastIndexOf(":");
      if (separator === -1) return [{ username: entry, role: "uploader" }];

      const username = entry.slice(0, separator).trim();
      const role = entry.slice(separator + 1).trim().toLowerCase();
      return username && isMediaRole(role) ? [{ username, role }] : [];
    });
}

const normalize = (username: string): string => username.trim().toLowerCase();

/**
 * Anyone not named in the list is a viewer. Viewing is open to everyone, so an
 * empty or mistyped list costs people nothing but the ability to upload.
 */
export function roleForUsername(
  username: string,
  assignments: ReadonlyArray<MediaRoleAssignment> = loadRoleAssignments(),
): MediaRole {
  const wanted = normalize(username);
  const match = assignments.find(
    (assignment) => normalize(assignment.username) === wanted,
  );
  return match ? match.role : "viewer";
}

export function permissionsForRole(role: MediaRole): MediaPermissions {
  return PERMISSIONS_BY_ROLE[role] ?? PERMISSIONS_BY_ROLE.viewer;
}
