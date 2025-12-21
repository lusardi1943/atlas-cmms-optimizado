package com.grash.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
public class DeactivationRequestDTO {
    private Date deactivatedUntil;
}
