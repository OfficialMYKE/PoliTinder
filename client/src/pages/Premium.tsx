import { Crown, CheckCircle } from "lucide-react";

"Prueba Jennyfer en vercel"
function Premium() {

    const comprarPremium = async () => {

        const respuesta = await fetch(
            "http://localhost:3000/api/stripe/create-checkout-session",
            {
                method: "POST",
            }
        );

        const datos = await respuesta.json();

        window.location.href = datos.url;
    };

    return (

        <div className="min-h-screen bg-gray-100 flex justify-center items-center">

            <div className="bg-white shadow-xl rounded-2xl p-10 w-[600px]">

                <div className="flex justify-center">

                    <Crown
                        size={60}
                        className="text-yellow-500"
                    />

                </div>

                <h1 className="text-4xl font-bold text-center mt-4">

                    PoliTinder Premium

                </h1>

                <p className="text-center text-gray-500 mt-2">

                    Obtén acceso a funciones exclusivas.

                </p>

                <div className="mt-8 space-y-4">

                    <div className="flex gap-3">

                        <CheckCircle className="text-green-500"/>

                        Perfil destacado

                    </div>

                    <div className="flex gap-3">

                        <CheckCircle className="text-green-500"/>

                        Conexiones ilimitadas

                    </div>

                    <div className="flex gap-3">

                        <CheckCircle className="text-green-500"/>

                        Ver quién reaccionó a tu perfil

                    </div>

                    <div className="flex gap-3">

                        <CheckCircle className="text-green-500"/>

                        Mensajes prioritarios

                    </div>

                    <div className="flex gap-3">

                        <CheckCircle className="text-green-500"/>

                        Sin publicidad

                    </div>

                </div>

                <div className="text-center mt-10">

                    <h2 className="text-3xl font-bold">

                        $4.99

                    </h2>

                    <p className="text-gray-500">

                        Pago mensual

                    </p>

                </div>

                <button

                    onClick={comprarPremium}

                    className="mt-8 w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700"

                >

                    Comprar Premium

                </button>

            </div>

        </div>

    );

}

export default Premium;