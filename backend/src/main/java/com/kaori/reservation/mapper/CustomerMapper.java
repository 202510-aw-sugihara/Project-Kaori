package com.kaori.reservation.mapper;

import com.kaori.reservation.model.Customer;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CustomerMapper {

    Customer findCustomerByEmail(String email);

    void insertCustomer(Customer customer);
}