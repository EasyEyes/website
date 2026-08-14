import {
  loadRoleAssignments,
  permissionsForRole,
  roleForUsername,
  ROLE_ENV_VAR,
} from "../mediaRoles";

const assignments = [
  { username: "denis", role: "admin" as const },
  { username: "yonathan", role: "uploader" as const },
];

describe("roleForUsername", () => {
  it("gives a named admin the admin role", () => {
    expect(roleForUsername("denis", assignments)).toBe("admin");
  });

  it("gives a named uploader the uploader role", () => {
    expect(roleForUsername("yonathan", assignments)).toBe("uploader");
  });

  it("treats anyone not named as a viewer rather than refusing them", () => {
    expect(roleForUsername("stranger", assignments)).toBe("viewer");
  });

  it("ignores case and stray whitespace", () => {
    expect(roleForUsername("  DENIS ", assignments)).toBe("admin");
  });

  it("falls back to viewer when the list is empty", () => {
    expect(roleForUsername("denis", [])).toBe("viewer");
  });
});

describe("permissionsForRole", () => {
  it("lets an admin upload and manage", () => {
    expect(permissionsForRole("admin")).toEqual({ upload: true, manage: true });
  });

  it("lets an uploader upload but not manage", () => {
    expect(permissionsForRole("uploader")).toEqual({
      upload: true,
      manage: false,
    });
  });

  it("lets a viewer do neither", () => {
    expect(permissionsForRole("viewer")).toEqual({
      upload: false,
      manage: false,
    });
  });
});

describe("loadRoleAssignments", () => {
  it("grants a bare username the uploader role", () => {
    expect(loadRoleAssignments("yonathan")).toEqual([
      { username: "yonathan", role: "uploader" },
    ]);
  });

  it("reads an explicit role after the colon", () => {
    expect(loadRoleAssignments("denis:admin")).toEqual([
      { username: "denis", role: "admin" },
    ]);
  });

  it("accepts commas, newlines, and padding around entries", () => {
    expect(loadRoleAssignments(" denis:admin ,\n yonathan \n")).toEqual([
      { username: "denis", role: "admin" },
      { username: "yonathan", role: "uploader" },
    ]);
  });

  it("drops an entry naming an unknown role rather than guessing", () => {
    expect(loadRoleAssignments("denis:superuser,yonathan")).toEqual([
      { username: "yonathan", role: "uploader" },
    ]);
  });

  it("leaves everyone a viewer when the variable is unset or empty", () => {
    expect(loadRoleAssignments(undefined)).toEqual([]);
    expect(loadRoleAssignments("")).toEqual([]);
    expect(loadRoleAssignments(" , ")).toEqual([]);
  });

  it("reads the variable from the environment by default", () => {
    const previous = process.env[ROLE_ENV_VAR];
    process.env[ROLE_ENV_VAR] = "denis:admin";
    try {
      expect(roleForUsername("denis", loadRoleAssignments())).toBe("admin");
    } finally {
      if (previous === undefined) delete process.env[ROLE_ENV_VAR];
      else process.env[ROLE_ENV_VAR] = previous;
    }
  });
});
