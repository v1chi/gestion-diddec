import React, { useState } from "react";
import { useRouter } from 'next/router';
import { Button } from "../componentes/ui/button.tsx";
import { Input } from "../componentes/ui/input.tsx";
import { Label } from "../componentes/ui/label.tsx";

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => { 
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/usuarios/login`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 
        }, 
        body: JSON.stringify({ correo: email, clave: password }),
    });

    if(response.ok){
      const data = await response.json(); 
      router.push('/dashboard');
    } else {
      const errorData = await response.json();
      alert(errorData.message || 'Credenciales incorrectas');
    }
  } catch (error){
    console.error('Error al iniciar sesión:', error);
    alert('Error al iniciar sesión. Por favor, inténtelo de nuevo.');
  }
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-purple-100">
      <div className="w-full max-w-sm space-y-6 rounded-lg bg-white p-6 shadow-lg">
        <form onSubmit={handleLogin}>
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-blue-600">
              ¡Bienvenido a la escuela de ayudantes y tutores!
            </h1>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="escueladetutores@ucn.cl"
                required
                type="email"
                className="border-blue-200 focus:border-blue-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                required
                type="password"
                className="border-blue-200 focus:border-blue-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700" type="submit">
              Iniciar sesión
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
