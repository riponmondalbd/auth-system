const VerifyEmailPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) => {
  const { token } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div>
        <h1 className="text-2xl font-bold">Verify Email</h1>

        <p className="mt-2">Token: {token}</p>
      </div>
    </main>
  );
};

export default VerifyEmailPage;
