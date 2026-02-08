variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be staging or production."
  }
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "berhot"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "eks_node_instance_types" {
  description = "EKS node instance types"
  type        = list(string)
  default     = ["t3.large"]
}

variable "eks_node_desired_size" {
  description = "Desired number of EKS nodes"
  type        = number
  default     = 3
}

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.r6g.large"
}

variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.r6g.large"
}

variable "kafka_instance_type" {
  description = "MSK broker instance type"
  type        = string
  default     = "kafka.m5.large"
}

variable "ecr_repositories" {
  description = "List of ECR repository names"
  type        = list(string)
  default = [
    "platform/identity-access",
    "platform/tenant-management",
    "platform/notification-center",
    "platform/billing-subscriptions",
    "platform/analytics-core",
    "products/pos-engine",
    "products/restaurant-pos",
    "products/cafe-pos",
    "products/retail-pos",
    "products/loyalty",
    "products/queue-waitlist",
    "products/shift-management",
    "products/payroll",
    "products/time-attendance",
    "products/marketing",
    "clients/merchant-dashboard",
    "clients/admin-panel",
  ]
}
