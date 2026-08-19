-- V37__Add_Consultant_Termination_Reason.sql
ALTER TABLE consultant_profiles
ADD COLUMN termination_reason TEXT;
