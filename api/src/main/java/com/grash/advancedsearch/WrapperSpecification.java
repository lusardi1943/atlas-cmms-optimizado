package com.grash.advancedsearch;

import com.grash.model.enums.EnumName;
import com.grash.model.enums.Priority;
import com.grash.model.enums.Status;
import com.grash.utils.Helper;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.*;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public class WrapperSpecification<T> implements Specification<T> {

    private final FilterField filterField;

    public WrapperSpecification(final FilterField filterField) {
        super();
        this.filterField = filterField;
    }

    @Override
    public Predicate toPredicate(Root<T> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
        System.out.println("PROCESSING FIELD: " + filterField.getField() + " OPERATION: " + filterField.getOperation());

        Object value = filterField.getValue();
        String strToSearch = "";
        
        if (value instanceof String) {
            strToSearch = StringUtils.stripAccents(value.toString().toLowerCase());
        } else if (value != null) {
            strToSearch = value.toString().toLowerCase();
        }

        Predicate result = null;
        SearchOperation operation = SearchOperation.getSimpleOperation(filterField.getOperation());
        
        if (operation == null) return null;

        switch (operation) {
            case CONTAINS:
                if (value instanceof String) {
                    Expression<String> stringPath = cb.lower(
                            cb.function("unaccent", String.class, getPath(root, filterField.getField()))
                    );
                    result = cb.like(stringPath, "%" + strToSearch + "%");
                } else {
                    result = cb.like(cb.lower(root.get(filterField.getField())), "%" + strToSearch + "%");
                }
                break;
            case DOES_NOT_CONTAIN:
                if (value instanceof String) {
                     Expression<String> stringPath = cb.lower(
                            cb.function("unaccent", String.class, getPath(root, filterField.getField()))
                    );
                    result = cb.notLike(stringPath, "%" + strToSearch + "%");
                } else {
                     result = cb.notLike(cb.lower(root.get(filterField.getField())), "%" + strToSearch + "%");
                }
                break;
            case BEGINS_WITH:
                if (value instanceof String) {
                    Expression<String> stringPath = cb.lower(
                            cb.function("unaccent", String.class, getPath(root, filterField.getField()))
                    );
                    result = cb.like(stringPath, strToSearch + "%");
                } else {
                    result = cb.like(cb.lower(root.get(filterField.getField())), strToSearch + "%");
                }
                break;
            case DOES_NOT_BEGIN_WITH:
                if (value instanceof String) {
                    Expression<String> stringPath = cb.lower(
                            cb.function("unaccent", String.class, getPath(root, filterField.getField()))
                    );
                    result = cb.notLike(stringPath, strToSearch + "%");
                } else {
                    result = cb.notLike(cb.lower(root.get(filterField.getField())), strToSearch + "%");
                }
                break;
            case ENDS_WITH:
                if (value instanceof String) {
                    Expression<String> stringPath = cb.lower(
                            cb.function("unaccent", String.class, getPath(root, filterField.getField()))
                    );
                    result = cb.like(stringPath, "%" + strToSearch);
                } else {
                    result = cb.like(cb.lower(root.get(filterField.getField())), "%" + strToSearch);
                }
                break;
            case DOES_NOT_END_WITH:
                 if (value instanceof String) {
                    Expression<String> stringPath = cb.lower(
                            cb.function("unaccent", String.class, getPath(root, filterField.getField()))
                    );
                    result = cb.notLike(stringPath, "%" + strToSearch);
                } else {
                    result = cb.notLike(cb.lower(root.get(filterField.getField())), "%" + strToSearch);
                }
                break;
            case EQUAL:
                Path<?> pathEq = getPath(root, filterField.getField());
                boolean isEntityIdEq = !String.class.isAssignableFrom(pathEq.getJavaType())
                        && !Number.class.isAssignableFrom(pathEq.getJavaType())
                        && !pathEq.getJavaType().isEnum()
                        && (value instanceof Number || (value instanceof String && ((String) value).matches("\\d+")));

                if (isEntityIdEq) {
                    Object val = value;
                    if (val instanceof String) {
                        try {
                            val = Long.parseLong((String) val);
                        } catch (NumberFormatException e) {
                            // ignore
                        }
                    }
                    result = cb.equal(pathEq.get("id"), val);
                } else if (value instanceof String) {
                    Expression<String> stringPath = cb.lower(
                            cb.function("unaccent", String.class, getPath(root, filterField.getField()))
                    );
                    result = cb.equal(stringPath, strToSearch);
                } else {
                    result = cb.equal(pathEq, filterField.getValue());
                }
                break;
            case NOT_EQUAL:
                Path<?> pathNe = getPath(root, filterField.getField());
                boolean isEntityIdNe = !String.class.isAssignableFrom(pathNe.getJavaType())
                        && !Number.class.isAssignableFrom(pathNe.getJavaType())
                        && !pathNe.getJavaType().isEnum()
                        && (value instanceof Number || (value instanceof String && ((String) value).matches("\\d+")));

                if (isEntityIdNe) {
                    Object val = value;
                    if (val instanceof String) {
                        try {
                            val = Long.parseLong((String) val);
                        } catch (NumberFormatException e) {
                            // ignore
                        }
                    }
                    result = cb.notEqual(pathNe.get("id"), val);
                } else if (value instanceof String) {
                    Expression<String> stringPath = cb.lower(
                            cb.function("unaccent", String.class, getPath(root, filterField.getField()))
                    );
                    result = cb.notEqual(stringPath, strToSearch);
                } else {
                    result = cb.notEqual(pathNe, filterField.getValue());
                }
                break;
            case NUL:
                result = cb.isNull(getPath(root, filterField.getField()));
                break;
            case NOT_NULL:
                result = cb.isNotNull(getPath(root, filterField.getField()));
                break;
            case GREATER_THAN:
                result = cb.greaterThan(getPath(root, filterField.getField()), (Comparable) filterField.getValue());
                break;
            case GREATER_THAN_EQUAL:
                if (filterField.getEnumName() != null && filterField.getEnumName().equals(EnumName.JS_DATE)) {
                    result = cb.greaterThanOrEqualTo(getPath(root, filterField.getField()), Helper.getDateFromJsString(filterField.getValue().toString()));
                } else {
                    result = cb.greaterThanOrEqualTo(getPath(root, filterField.getField()), (Comparable) filterField.getValue());
                }
                break;
            case LESS_THAN:
                result = cb.lessThan(getPath(root, filterField.getField()), (Comparable) filterField.getValue());
                break;
            case LESS_THAN_EQUAL:
                if (filterField.getEnumName() != null && filterField.getEnumName().equals(EnumName.JS_DATE)) {
                    result = cb.lessThanOrEqualTo(getPath(root, filterField.getField()), Helper.getDateFromJsString(filterField.getValue().toString()));
                } else {
                    result = cb.lessThanOrEqualTo(getPath(root, filterField.getField()), (Comparable) filterField.getValue());
                }
                break;
            case IN:
                System.out.println("IN CLAUSE for values: " + filterField.getValues());
                Path<Object> pathIn = (Path<Object>) getPath(root, filterField.getField());
                boolean isEntityIdIn = !String.class.isAssignableFrom(pathIn.getJavaType())
                                     && !Number.class.isAssignableFrom(pathIn.getJavaType())
                                     && !pathIn.getJavaType().isEnum();
                
                 if (isEntityIdIn && !filterField.getValues().isEmpty()) {
                    Object sample = filterField.getValues().get(0);
                    if (sample instanceof Number || (sample instanceof String && ((String)sample).matches("\\d+"))) {
                        pathIn = pathIn.get("id");
                        // We might need to transform string values to Longs for In clause? 
                        // Usually DB handles it if column is int and param is string '123'.
                    }
                }
                
                CriteriaBuilder.In<Object> inClause = cb.in(pathIn);
                
                // If we switched to ID path, we should try to ensure values are Longs if they are Strings
                boolean finalIsEntityIdIn = isEntityIdIn; // final for lambda
                filterField.getValues().forEach(val -> {
                     Object realVal = getRealValue(filterField.getEnumName(), val);
                     if (finalIsEntityIdIn && realVal instanceof String && ((String)realVal).matches("\\d+")) {
                         try {
                             realVal = Long.parseLong((String)realVal);
                         } catch (Exception e) {}
                     }
                     inClause.value(realVal);
                });
                result = inClause;
                break;
            case IN_MANY_TO_MANY:
                Join<Object, Object> join = root.join(filterField.getField(), filterField.getJoinType());
                CriteriaBuilder.In<Object> inClause1 = cb.in(join.get("id"));
                filterField.getValues().forEach(inClause1::value);
                result = inClause1;
                break;
        }
        return wrapAlternatives(result, root, query, cb);
    }

    private Predicate wrapAlternatives(Predicate result, Root<T> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
        if (filterField.getAlternatives() == null || filterField.getAlternatives().size() == 0) {
            return result;
        } else {
            List<SpecificationBuilder<T>> specificationBuilders = filterField.getAlternatives().stream().map(alternative -> {
                SpecificationBuilder<T> builder = new SpecificationBuilder<>();
                builder.with(alternative);
                return builder;
            }).collect(Collectors.toList());
            List<Predicate> predicates = specificationBuilders.stream().map(specificationBuilder -> specificationBuilder.build().toPredicate(root, query, cb)).collect(Collectors.toList());
            predicates.add(result);
            Predicate[] predicatesArray = predicates.toArray(new Predicate[0]);
            return cb.or(predicatesArray);
        }
    }

    private Object getRealValue(EnumName enumName, Object value) {
        if (enumName == null) {
            return value;
        }
        if (value instanceof String) {
            switch (enumName) {
                case PRIORITY:
                    return Priority.getPriorityFromString(value.toString());
                case STATUS:
                    return Status.getStatusFromString(value.toString());
                case JS_DATE:
                    return Helper.getDateFromJsString(value.toString());
                default:
                    return value;
            }
        }
        return value;
    }

    private Path getPath(Root<T> root, String attributeName) {
        Path path = root;
        String[] parts = attributeName.split("\\.");
        if (parts.length > 1) {
            for (int i = 0; i < parts.length - 1; i++) {
                path = getOrCreateJoin((From) path, parts[i]);
            }
            return path.get(parts[parts.length - 1]);
        } else {
            return path.get(attributeName);
        }
    }

    private Join<?, ?> getOrCreateJoin(From<?, ?> from, String attribute) {
        for (Join<?, ?> join : from.getJoins()) {
            boolean sameName = join.getAttribute().getName().equals(attribute);
            if (sameName && join.getJoinType().equals(JoinType.LEFT)) {
                return join;
            }
        }
        return from.join(attribute, JoinType.LEFT);
    }
}
