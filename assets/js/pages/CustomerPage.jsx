import React, { useState, useEffect } from 'react';
import Field from '../components/froms/Field';
import { Link } from 'react-router-dom';
import CustomersAPI from "../services/customersAPI";
import { toast } from 'react-toastify';
import FormContentLoader from '../components/loaders/FormContentLoader';

const CustomerPage = ({match, history}) => {

    const {id = "new"} = match.params;

    const [customer, setCustomer] = useState({
        lastName: "",
        firstName:"",
        email:"",
        company:""
    })

    const [erros, setErrors] = useState({
        lastName: "",
        firstName:"",
        email:"",
        company:""
    });

    const [loading, setLoading] = useState(false);

    const [editing, setEditing] = useState(false);

    // Récupération du cutomer en fonction de l'identifiant
    const fetchCustomer = async id => {
        try {
            const {firstName, lastName, email, company}=  await CustomersAPI.find(id);
            setCustomer({firstName, lastName, email, company});
            setLoading(false);
        } catch (error) {
            toast.error("Le client n'a pas pu être chargé");
            console.log(error);
            history.replace('/customers');
        }
        
    }
       
    // chargement du customer si besoin au chargement du composant ou au changement de l'identifiant
    useEffect(() => {
        if(id !== "new"){
            setLoading(true);
            setEditing(true);
            fetchCustomer(id);
        } 
    }, [id]);
   

    // Gestion des champs
    const handleChange = ({currentTarget}) => {
        const {value, name} = currentTarget;
        setCustomer({...customer, [name]: value})
    }

    // Gestion du submit du formulaire
    const handleSubmit = async event => {
        event.preventDefault();

        try {
            setErrors("");
            if(editing){
                await CustomersAPI.update(id, customer);
                toast.success("Le client a bien été modifié");
            }else {
                await CustomersAPI.create(customer);
                toast.success("Le client a bien été créé");
                history.replace("/customers");
            }
        } catch ({response}) {
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
        {(!editing && <h1>Création d'un client</h1>) || (
            <h1>Modefication du client</h1>
        )}
        {loading && <FormContentLoader />}
        {!loading && (<form onSubmit = {handleSubmit}>
            <Field 
                name="lastName" 
                label ="Nom de famille" 
                placeholder="Nom de famille du client"
                value = {customer.lastName}
                onChange={handleChange}
                error={erros.lastName}
             />
            <Field 
                name="firstName" 
                label ="Prénom" 
                placeholder="Prénom du client" 
                value = {customer.firstName}
                onChange={handleChange}
                error={erros.firstName}
            />
            <Field 
                name="email" 
                label ="Email" 
                placeholder="Adresse email du client" 
                type="email" 
                value = {customer.email} 
                onChange={handleChange}
                error={erros.email}
            />
            <Field 
                name="company" 
                label ="Entreprise" 
                placeholder="Entreprie du client" 
                value = {customer.comapny} 
                onChange={handleChange}
                error={erros.comapny}
            />

            <div className="form-group">
                <button type="submit" className="btn btn-success">Enregistrer</button>
                <Link to="/customers" className="btn btn-link">Retour à la liste</Link>
            </div>
        </form>)}
        </>
     );
}
 
export default CustomerPage;