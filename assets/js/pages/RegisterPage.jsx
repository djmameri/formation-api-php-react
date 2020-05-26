import React, {useState} from 'react';
import Field from '../components/froms/Field';
import { Link } from 'react-router-dom';
import UserAPI from '../services/usersAPI';
import { toast } from 'react-toastify';

const RegisterPage = ({history}) => {

    const [user, setUser] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        passwordConfirm:""
    });

    const [errors, setErrors] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        passwordConfirm:""
    });

    // Gestion des champs des inputs dans le formulaire
    const handleChange = ({currentTarget}) => {
        const {value, name} = currentTarget;
        setUser({...user, [name]: value})
    }

     // Gestion du submit du formulaire
    const handleSubmit = async event => {
        event.preventDefault();

        const apiError = {};

        if(user.password !== user.passwordConfirm){
            apiError.passwordConfirm = "Votre confirmation de mot de passe n'est pas conforme avec le mot de passe original";
            setErrors(apiError);
            toast.error("Des erreurs dans votre formulaire !");
            return;
        }

        try {
            await UserAPI.register(user);
            setErrors({});
            toast.success("Vous êtes désormais inscrit, vous pouvez vous connecter !");
            history.replace('/login');
        } catch (error) {
            console.log(error.response);
            const {violations} = error.response.data;

            if(violations){
                
                violations.forEach(violation => {
                    apiError[violation.propertyPath] = violation.message;
                });
                setErrors(apiError);
            }
            toast.error("Des erreurs dans votre formulaire !");
            
        }
       
    }

    return (  
        <>
            <h1>Inscription</h1>
            <form onSubmit={handleSubmit}>
                <Field 
                    name="firstName" 
                    label="Prénom" 
                    placeholder="Votre prénom" 
                    error={errors.firstName} 
                    value={user.firstName}
                    onChange={handleChange}
                    /> 
                <Field 
                    name="lastName" 
                    label="Nom" 
                    placeholder="Votre nom" 
                    error={errors.lastName} 
                    value={user.lastName}
                    onChange={handleChange}
                    /> 
                 <Field 
                    name="email" 
                    label="email" 
                    placeholder="Votre email"
                    type="email" 
                    error={errors.email} 
                    value={user.email}
                    onChange={handleChange}
                    /> 
                 <Field 
                    name="password"
                    type="password" 
                    label="Mot de passe" 
                    placeholder="Votre mot de passe" 
                    error={errors.password} 
                    value={user.password}
                    onChange={handleChange}
                    /> 
                 <Field 
                    name="passwordConfirm" 
                    type="password" 
                    label="Confirmation de mot de passe" 
                    placeholder="Confirmez votre mot de passe" 
                    error={errors.passwordConfirm} 
                    value={user.passwordConfirm}
                    onChange={handleChange}
                    /> 
                 <div className="form-group">
                <button type="submit" className="btn btn-success">Confirmation</button>
                <Link to="/login" className="btn btn-link"> J'ai déjà un compte</Link>
            </div>
            </form>
        </>
    );
}
 
export default RegisterPage;