import React , {useEffect, useState} from 'react';
import Pagination from '../components/Pagination';
import moment from 'moment';

import InvoiceAPI from "../services/invoicesAPI";
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import TableLoader from '../components/loaders/TableLoader';

const STATUS_CLASSES = {
    PAID: "success",
    SENT:"primary",
    CANCELLED: "danger"
}

const STATUS_LABELS = {
    PAID: "Payée",
    SENT:"Envoyée",
    CANCELLED: "Annulée"
}

const InvoicesPage = props => {

    const [invoices, setInvoices] = useState([]);
    const [currentPage, setCurrentPage]= useState(1);
    const [search, setSearch] = useState("");
    const itemsPerPage = 10;
    const [loading, setLoading] = useState(true);

    // Permet d'aller récupérer les factures
    const fetchInvoices = async () => {
        try {
            const data = await InvoiceAPI.findAll(); 
            setInvoices(data);
            setLoading(false);
        } catch (error) {
            toast.error("Erreur lors du chargement des factures !");
        } 
    }

    // Charger les invoices au chargement du composant
    useEffect(() => {
        fetchInvoices();
    },[]);

     // Gestion du chargement de page
    const handlePageChange = page => setCurrentPage(page);

     // Gestion de la recherche
    const handelSearch = ({currentTarget}) => {
         setSearch(currentTarget.value);
         setCurrentPage(1);
    }

    // Gestion de la suppression
    const handleDelete = async id => {
        const originalInvoices = [...invoices];

        setInvoices(invoices.filter(invoice => invoice.id !== id));

        try {
            await InvoiceAPI.delete(id);
            toast.success("La facutre a bien été suprimée");
        } catch (error) {
            toast.error("Une erreur est servenue !");
            console.log(error.response);
            setInvoices(originalInvoices);
        }
    }

    // Gestion du format de date
    const formatDate = (str) => moment(str).format('DD/MM/YYYY');
    
    // Filtrage des customers  en fonction de la recherche
    const filtredInvoices = invoices.filter(
        i => 
            i.customer.firstName.toLowerCase().includes(search.toLowerCase()) || 
            i.customer.lastName.toLowerCase().includes(search.toLowerCase()) ||
            i.amount.toString().includes(search.toLowerCase())||
            STATUS_LABELS[i.status].toLowerCase().includes(search.toLowerCase())  
    );

    //Pagination des données
    const paginatedInvoices = Pagination.getData(
        filtredInvoices, 
        currentPage, 
        itemsPerPage
    );

    return (  
        <>
             <div className="mb-3 d-flex justify-content-between align-items-center">
                <h1>Liste des factures</h1>
                <Link to="/invoices/new" className="btn btn-primary"> Créer une facture</Link>
            </div>
            <div className="form-group">
                <input 
                    type="text" 
                    onChange = {handelSearch} 
                    value = {search} 
                    className="form-control" 
                    placeholder="Rechercher ..."
                />
            </div>

            <table className="table table-hover">

                <thead>
                    <tr>
                        <th>Numéro</th>
                        <th>Client</th>
                        <th className ="text-center">Date d'envoi</th>
                        <th className ="text-center">Statut</th>
                        <th className ="text-center">Montant</th>
                        <th></th>
                    </tr>
                </thead>

                { !loading && (<tbody>
                    {paginatedInvoices.map(invoice =>
                        <tr key={invoice.id}>
                        <td>{invoice.chrono}</td>
                        <td>
                            <Link to ={"/customers/" + invoice.customer.id}>
                                {invoice.customer.firstName}{invoice.customer.lastName}
                            </Link>
                        </td>
                            <td className ="text-center"> {formatDate(invoice.sentAt)}</td>
                        <td className ="text-center">
                            <span className={"badge badge-"+STATUS_CLASSES[invoice.status]}>{STATUS_LABELS[invoice.status]}</span>
                        </td>
                        <td className ="text-center">
                            {invoice.amount.toLocaleString()}
                        </td>
                        <td>
                            <Link to={"/invoices/" +invoice.id} className="btn btn-sm btn-primary mr-1">Editer</Link>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(invoice.id)}>Supprimer</button>
                        </td>
                    </tr>
                    )}
                    
                </tbody>)}

            </table>
            {loading && <TableLoader />}

            <Pagination currentPage = {currentPage} 
                        itemsPerPage = {itemsPerPage} 
                        length = {filtredInvoices.length}
                        onPageChanged={handlePageChange}
                />
        </>
    );
};

export default InvoicesPage;