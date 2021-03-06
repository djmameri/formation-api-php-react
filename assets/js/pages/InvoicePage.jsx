import React, { useState, useEffect } from 'react';
import Field from '../components/froms/Field';
import Select from '../components/froms/Select';
import { Link } from 'react-router-dom';
import CustomerAPI from "../services/customersAPI";
import InvoicesAPI from "../services/invoicesAPI";
import { toast } from 'react-toastify';
import FormContentLoader from '../components/loaders/FormContentLoader';

const InvoicePage = ({ history, match }) => {
    const {id = "new"} = match.params;

    const [invoice, setInvoice] = useState({
        amount:"",
        customer:"",
        status:"SENT"
    });
    const [customers, setCustomers] = useState([]);
    const [editing, setEditing] = useState(false);
    const [errors, setErrors] = useState({
        amount:"",
        customer:"",
        status:""
    });

    const [loading, setLoding] = useState(true);

    // Récupération des clients
    const fetchCustomers = async () => {
        try {
            const data = await CustomerAPI.findAll();
            setCustomers(data);
            setLoding(false);

            if(!invoice.customer) setInvoice({ ...invoice, customer: data[0].id });
        } catch (error) {
            toast.error("Impossible de charger les clients !");
            history.replace('/invoices');
        }
    }

    // Récupération d'une facture
    const fetchInvoice = async id => {
        try {
            const { amount, status, customer } = await InvoicesAPI.find(id);
            setInvoice({ amount, status, customer:customer.id });
            setLoding(false);
        } catch (error) {
            toast.error("Impossible de charger la facture demandée");
            history.replace('/invoices');
        }
    };

    // Récupération de la liste des clients à chaque chargement du composant
    useEffect(() => {
        fetchCustomers()
    }, []);

    //Récupération de la bonne facture quand l'identifiant de l'URL change
    useEffect(() => {
        if(id !== "new"){
            setEditing(true);
            fetchInvoice(id);
        }

    }, [id]);

    // Gestion des champs
    const handleChange = ({currentTarget}) => {
        const {value, name} = currentTarget;
        setInvoice({...customer, [name]: value})
    }

     // Gestion du submit du formulaire
     const handleSubmit = async event => {
        event.preventDefault();

        try {
            setErrors("");
            if(editing){
                await InvoicesAPI.update(id, invoice);
                toast.success("La facture a bien été modifiée");
            }else{
                await InvoicesAPI.create(invoice);
                toast.success("La facture a bien été enregistrée");
                history.replace("/invoices");
            }
        }catch ({response}) {
            const {violations} = response.data;
            if(violations){
                const apiErrors = {};
                violations.forEach(({propertyPath, message}) => {
                    apiErrors[propertyPath] = message;
                })

                setErrors(apiErrors);
                toast.error("Des erreurs dans votre formulaire !");
            }
            
        }
    }

    return ( 
        <>
            {editing && <h1>Modification d'une facture</h1> || <h1>Création d'une facture</h1>}
            {loading && <FormContentLoader />}
            {!loading && (<form onSubmit ={handleSubmit}>
                <Field 
                    name ="amount"
                    type="number"
                    placeholder="Montant de la facture"
                    label="Montant"
                    onChange={handleChange}
                    value={invoice.amount}
                    error={setErrors.amount}
                />

                <Select 
                    name="customer" 
                    label="Client" 
                    value={invoice.customer} 
                    error={errors.customer}
                    onChange={handleChange}
                >
                    {customers.map(customer => (
                        <option key={customer.id} value ={customer.id}>
                            {customer.firstName} {customer.lastName}
                        </option>
                    ))}
                </Select> 

                <Select 
                    name="status" 
                    label="Statut" 
                    value={invoice.status} 
                    error={errors.status}
                    onChange={handleChange}
                >
                    <option value="SENT">Envoyée</option>
                    <option value="PAID">Payée</option>
                    <option value="CANCELLED">Annulée</option>
                </Select> 

                <div className="form-group">
                <button type="submit" className="btn btn-success">Enregistrer</button>
                <Link to="/invoices" className="btn btn-link">Retour à la liste</Link>
            </div>

            </form>)}
        </>
     );
}
 
export default InvoicePage;