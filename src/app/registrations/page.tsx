// src/app/registrations/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';


interface Registration {
    id: string;
    company_name: string;
    ico: string;
    email: string;
    created_at: string;
    status: string;
}

const RegistrationsPage: React.FC = () => {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortField, setSortField] = useState<'created_at' | 'company_name' | 'status'>('created_at'); // Přidáno pro řazení
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc'); // Přidáno pro řazení

    useEffect(() => {
        const fetchRegistrations = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data, error } = await supabase
                    .from('registration_requests')
                    .select('*')
                    .order(sortField, { ascending: sortDirection === 'asc' }); // Řazení

                if (error) {
                    setError(error.message);
                } else {
                    setRegistrations(data || []);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRegistrations();
    }, [sortField, sortDirection]); // Sleduj změny v řazení

    const handleApprove = async (registration: Registration) => {
      // Použijeme servisní klíč pro administrátorské operace
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Supabase URL or Service Role Key is not defined.');
        throw new Error('Supabase configuration is missing.');
      }
    
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string
      );

      try {
        // 1. Vygeneruj UUID
        const companyId = uuidv4();

        // 2. Přesun dat do 'companies'
        const { error: companyError } = await supabaseAdmin
          .from('companies')
          .insert([
            {
              id: companyId, // Použij UUID
              company_name: registration.company_name,
              ico: registration.ico,
              dic: registration.dic,
              street: registration.street,
              city: registration.city,
              postal_code: registration.psc,
              country: registration.country,
              contact_person_name: registration.contact_person_name,
              contact_person_surname: registration.contact_person_surname,
              contact_email: registration.email,
              contact_phone: registration.phone,
              wallet_balance: 0, // Inicializuj peněženku
            },
          ]);

        if (companyError) {
          console.error("Error inserting into companies:", companyError);
          setError('Failed to create company');
          return
        }

        // 3. Nastavení statusu v 'registration_requests' na 'approved'
        const { error: updateError } = await supabaseAdmin
          .from('registration_requests')
          .update({ status: 'approved' })
          .eq('id', registration.id);
        if (updateError) {
          console.error("Update reg_req table error:", updateError);
          setError("Failed to update request");
          return
        }

        // 4. Vytvoření uživatele v Supabase Auth
        const { data: user, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: registration.email,
          password: uuidv4(), // Generuj náhodné heslo - uživatel si ho nastaví přes odkaz
          user_metadata: { company_id: companyId }, // Ulož ID firmy do metadat uživatele
          email_confirm: false, // Nepotvrzuj email automaticky
        });

        if (authError) {
          console.error("Error creating user in Supabase Auth:", authError);
          // Zde bys měl *rollbacknout* předchozí operace (smazat záznam z 'companies')
          setError('Failed to create user');
          return
        }

        // 5. Odeslání emailu s odkazem pro nastavení hesla
        const { error: resetPasswordError } = await supabaseAdmin.auth.resetPasswordForEmail(registration.email, {
          redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`, // URL, kam bude uživatel přesměrován
        });

        if (resetPasswordError) {
          console.log("reset password error:", resetPasswordError)
          // Zaloguj chybu, ale nepokračuj v zobrazování chyby uživateli
        }

        // Aktualizace stavu -  efektivnější varianta, bez nutnosti znovu načítat data
        setRegistrations(registrations.map(reg => reg.id === registration.id ? { ...reg, status: 'approved' } : reg));


      } catch (err: any) {
        setError(err.message);
      }
    };

    const handleReject = async (registrationId: string) => {
        // Použijeme servisní klíč pro administrátorské operace
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
          console.error('Supabase URL or Service Role Key is not defined.');
          throw new Error('Supabase configuration is missing.');
        }

        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL as string,
          process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string
        );

        try {
            const { error: updateError } = await supabaseAdmin
                .from('registration_requests')
                .update({ status: 'rejected' })
                .eq('id', registrationId);

            if (updateError) {
                setError(updateError.message);
            } else {
              setRegistrations(registrations.map(reg => reg.id === registrationId ? { ...reg, status: 'rejected' } : reg));
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const toggleSort = (field: 'created_at' | 'company_name' | 'status') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc'); // Výchozí směr pro nové pole
        }
    };

    if (loading) {
        return <div>Načítání...</div>;
    }

    if (error) {
        return <div>Chyba: {error}</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Registrace</h1>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" onClick={() => toggleSort('created_at')}>
                            Datum
                          {sortField === 'created_at' && (sortDirection === 'asc' ? <ChevronUpIcon className="h-4 w-4 inline" /> : <ChevronDownIcon className="h-4 w-4 inline" />)}

                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" onClick={() => toggleSort('company_name')}>
                            Firma
                          {sortField === 'company_name' && (sortDirection === 'asc' ? <ChevronUpIcon className="h-4 w-4 inline" /> : <ChevronDownIcon className="h-4 w-4 inline" />)}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            IČO
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" onClick={() => toggleSort('status')}>
                            Stav
                          {sortField === 'status' && (sortDirection === 'asc' ? <ChevronUpIcon className="h-4 w-4 inline" /> : <ChevronDownIcon className="h-4 w-4 inline" />)}
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Akce</span>
                        </th>
                    </tr>
                </thead>
                
                <tbody className="bg-white divide-y divide-gray-200">
                    {registrations.map((registration) => (
                        <tr key={registration.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{new Date(registration.created_at).toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{registration.company_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{registration.ico}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{registration.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{registration.status}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {registration.status === 'pending' && (
                                  <>
                                                                      <button onClick={() => handleApprove(registration)} className="text-indigo-600 hover:text-indigo-900 mr-2">
                                        Schválit
                                    </button>
                                    <button onClick={() => handleReject(registration.id)} className="text-red-600 hover:text-red-900">
                                        Zamítnout
                                    </button>
                                  </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RegistrationsPage;