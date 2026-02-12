import { createContext, useContext, useState } from "react";

interface AppointmentContextType {
appointments: any[];
setAppointments: React.Dispatch<React.SetStateAction<any[]>>;
}

const AppointmentsContext = createContext<AppointmentContextType | null>(null);

export const AppointmentsProvider = ({ children }: { children: React.ReactNode }) => {
const [appointments, setAppointments] = useState<any[]>([]);

return (
    <AppointmentsContext.Provider value={{ appointments, setAppointments }}>
    {children}
    </AppointmentsContext.Provider>
);
};

export const useAppointments = () => {
const context = useContext(AppointmentsContext);
if (!context) throw new Error("useAppointments must be used inside AppointmentsProvider");
return context;
};
