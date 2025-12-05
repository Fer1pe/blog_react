import { useState, useEffect } from "react";
import { auth } from "../FirebaseConn";
import { onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";
import Spinner from "../Components/Spinner"; // CORRIGIDO

export default function Private({ children }) {
    const [loading, setLoading] = useState(true);
    const [signed, setSigned] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            setSigned(!!user);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    if (loading) {
        return <Spinner />;
    }

    if (!signed) {
        return <Navigate to="/" />;
    }

    return children;
}
