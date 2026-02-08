# Berhot Platform – MSK Module
variable "environment" { type = string }
variable "vpc_id" { type = string }
variable "private_subnet_ids" { type = list(string) }

variable "broker_instance_type" { type = string }



output "bootstrap_brokers" { value = "placeholder" }
