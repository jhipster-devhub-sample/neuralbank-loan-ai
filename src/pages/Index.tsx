import { Button } from "@/components/ui/button";

const Index = () => {
  const handleLogin = () => {
    window.location.href = '/auth/callback';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">N</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            NeuralBank
          </h1>
        </div>
        <p className="text-xl text-muted-foreground mb-8">Financial Risk Evaluation AI Application Demo</p>
        <Button onClick={handleLogin} size="lg" className="text-lg px-8">
          Ingresar
        </Button>
      </div>
    </div>
  );
};

export default Index;
