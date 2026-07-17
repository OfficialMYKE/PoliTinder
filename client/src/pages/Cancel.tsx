import { CircleX } from "lucide-react";

function Cancel() {

    return (

        <div className="min-h-screen flex justify-center items-center">

            <div className="bg-white p-10 rounded-2xl shadow-lg text-center">

                <CircleX
                    size={70}
                    className="text-red-600 mx-auto"
                />

                <h1 className="text-3xl font-bold mt-5">

                    Pago cancelado

                </h1>

                <p className="text-gray-500 mt-3">

                    No se realizó ningún cargo.

                </p>

            </div>

        </div>

    );

}

export default Cancel;