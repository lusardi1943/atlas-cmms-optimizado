package com.grash.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.grash.model.abstracts.CompanyAudit;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.context.MessageSource;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Entity
@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class Task extends CompanyAudit {
    // [MODIFICADO] Cambiado a FetchType.LAZY para mejorar el rendimiento.
    // Impacto: Evita la carga innecesaria de la entidad TaskBase (Problema N+1), acelerando las consultas de listas de tareas.
    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    private TaskBase taskBase;

    private String notes;

    private String value;

    // [MODIFICADO] Cambiado a FetchType.LAZY.
    // Impacto: Las imágenes solo se cargarán cuando se acceda explícitamente a la lista, ahorrando memoria y tiempo.
    @OneToMany(mappedBy = "task", fetch = FetchType.LAZY)
    private List<File> images = new ArrayList<>();

    // [MODIFICADO] Cambiado a FetchType.LAZY.
    // Impacto: Evita cargar la Orden de Trabajo completa por cada tarea, optimizando el rendimiento en operaciones masivas.
    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private WorkOrder workOrder;

    // [MODIFICADO] Cambiado a FetchType.LAZY.
    // Impacto: Previene la carga en cascada del Mantenimiento Preventivo, mejorando la velocidad de respuesta.
    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private PreventiveMaintenance preventiveMaintenance;

    public Task(TaskBase taskBase, WorkOrder workOrder, PreventiveMaintenance preventiveMaintenance, String value) {
        this.taskBase = taskBase;
        this.workOrder = workOrder;
        this.value = value;
        this.preventiveMaintenance = preventiveMaintenance;
    }

    @JsonIgnore
    public String getTranslatedValue(Locale locale, MessageSource messageSource) {
        List<String> taskOptions = Arrays.asList("OPEN", "ON_HOLD", "IN_PROGRESS", "COMPLETE", "PASS", "FLAG", "FAIL");
        if (taskOptions.contains(value)) {
            return messageSource.getMessage(value, null, locale);
        } else return value;
    }
}
