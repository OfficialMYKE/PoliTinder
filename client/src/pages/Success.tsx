import { CheckCircle2 } from "lucide-react";

function Success() {

    return (

        <div className="min-h-screen flex justify-center items-center">

            <div className="bg-white p-10 rounded-2xl shadow-lg text-center">

                <CheckCircle2
                    size={70}
                    className="text-green-600 mx-auto"
                />

                <h1 className="text-3xl font-bold mt-5">

                    ¡Pago realizado correctamente!

                </h1>

                <p className="text-gray-500 mt-3">

                    Ahora eres usuario Premium.

                </p>

            </div>

        </div>

    );

}

export default Success;