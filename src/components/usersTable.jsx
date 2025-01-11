import React, { useEffect, useState } from 'react';
import { Table, Pagination, Form, Button } from 'react-bootstrap';
import '../styles/usersTable.css';

const DataTable = () => {
  const [users, setUsersData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const usersPerPage = 10;

  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/user-count');
        const data = await response.json();
        if (data.count) {
          setTotalUsers(data.count);
        }
      } catch (error) {
        console.error('Error fetching user count:', error);
      }
    };

    fetchTotalUsers();
  }, []);

  const fetchUsersData = async (page = currentPage) => {
    try {
      const response = await fetch(`http://localhost:5000/get-users?page=${page}`);
      const data = await response.json();
      if (data.users) {
        setUsersData(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, [currentPage]);

  const totalPages = Math.ceil(totalUsers / usersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:5000/get-user?${isNaN(searchTerm) ? `name=${searchTerm}` : `id=${searchTerm}@c.us`}`);
      const data = await response.json();
      if (data.user) {
        setUsersData([data.user]);
      } else {
        setUsersData([]);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleDelete = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/delete-user/${userId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.message) {
        console.log(data.message);
        fetchUsersData(); // Refresh the user list
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="dark-theme">
      {/* Search Input */}
      <Form inline className="mb-3">
        <Form.Control
          type="text"
          placeholder="Procure por nome ou número"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          className="mr-2 dark-input"
        />
        <Button variant="secondary" onClick={handleSearch}>
          Procurar
        </Button>
      </Form>

      <Table bordered hover className="users-table table-dark">
        <thead>
          <tr>
            <th>Número</th>
            <th>Nome</th>
            <th>Aniversário</th>
            <th>Usa a cada</th>
            <th>Chamar no dia</th>
            <th>Ações</th> {/* New column for actions */}
          </tr>
        </thead>
        <tbody>
          {users.map((row) => (
            <tr key={row.id}>
              <td>{row.id.split("@c.us")}</td>
              <td>{row.name}</td>
              <td>
                {(() => {
                  const [day, month] = row.birthday.split('/');
                  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}`;
                })()}
              </td>
              <td>{row.period} dias</td>
              <td>{row.callDate}</td>
              <td>
                <Button variant="danger" size="sm" onClick={() => handleDelete(row.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      {!searchTerm && (
        <Pagination className="dark-pagination">
          {[...Array(totalPages)].map((_, index) => (
            <Pagination.Item
              key={index}
              active={index + 1 === currentPage}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      )}
    </div>
  );
};

export default DataTable;
