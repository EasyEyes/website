export default async (request: Request) => {
  const { payload } = await request.json();

  console.log("[deploy-success-probe] legacy deploy-succeeded event received", {
    deploymentId: payload?.id,
  });
};
