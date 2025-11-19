package com.grash.repository;

import com.grash.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByWorkOrder_Id(Long id);

    List<Task> findByPreventiveMaintenance_Id(Long id);

    // [AÑADIDO] Método para borrar tareas por ID de Orden de Trabajo de forma eficiente.
    // Impacto: Permite eliminar todas las tareas asociadas en una sola operación de base de datos, en lugar de una por una.
    void deleteByWorkOrder_Id(Long id);

    // [AÑADIDO] Método para borrar tareas por ID de Mantenimiento Preventivo de forma eficiente.
    // Impacto: Mejora drástica en el tiempo de actualización de mantenimientos preventivos complejos.
    void deleteByPreventiveMaintenance_Id(Long id);
}
