import React, {useState, useContext} from 'react';
import AuthAPI from "../services/authAPI";
import AuthContext from "../contexts/AuthContext";
import Field from '../components/froms/Field';

const LoginPage = ({history}) => {

    const {setIsAuthenticated} = useContext(AuthContext);

    const [credentials, setCredentials] = useState({
        username: "",
        password: ""
    });

    const [error, setError] = useState("");
    // Gestion des champs
    const handleChange = ({currentTarget}) => {
        const {value, name} = currentTarget;
        setCredentials({...credentials, [name]: value})
    }

    // Gestion du submit
    const handleSubmit = async event => {
        event.preventDefault();

        try {
           await AuthAPI.authenticate(credentials);
           setError("");
           setIsAuthenticated(true);
           history.replace("/customers");
        } catch (error) {
            console.log(error.response);
            setError("Aucun compte ne possède cette adresse ou alors les informations ne correspondent pas");
        }
    }

    return (  
        <>
            <h1>Connexion</h1>
            <form onSubmit = {handleSubmit}>
                <Field 
                    label = "Adresse email" 
                    name = "username" 
                    id="username"
                    value = {credentials.username} 
                    onChange={handleChange}
                    placeholder ="Adresse email de connexion" 
                    type="email"
                    error = {error} />

                <Field 
                    label = "Mot de passe" 
                    name = "password"
                    id="password" 
                    value = {credentials.password} 
                    onChange={handleChange}
                    type="password"
                    error = "" />
                <div className="form-group">
                    <button type="submit" className="btn btn-success">
                        Je me connecte
                    </button></div>
            </form>
        </>
    );
}
 
export default LoginPage;
