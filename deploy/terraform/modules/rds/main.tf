resource "aws_rds_cluster" "main" {
  cluster_identifier = "berhot-${var.environment}"
  engine             = "aurora-postgresql"
  engine_version     = "16.1"
  database_name      = var.database_name
  master_username    = "berhot_admin"
  master_password    = var.master_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = var.environment == "production" ? 30 : 7
  preferred_backup_window = "03:00-04:00"
  deletion_protection     = var.environment == "production"
  storage_encrypted       = true

  serverlessv2_scaling_configuration {
    min_capacity = var.environment == "production" ? 2 : 0.5
    max_capacity = var.environment == "production" ? 64 : 8
  }
}

resource "aws_rds_cluster_instance" "main" {
  count              = var.environment == "production" ? 2 : 1
  identifier         = "berhot-${var.environment}-${count.index}"
  cluster_identifier = aws_rds_cluster.main.id
  instance_class     = "db.serverless"
  engine             = "aurora-postgresql"
}

resource "aws_db_subnet_group" "main" {
  name       = "berhot-${var.environment}"
  subnet_ids = var.private_subnet_ids
}

resource "aws_security_group" "rds" {
  name_prefix = "berhot-rds-${var.environment}"
  vpc_id      = var.vpc_id
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }
}

variable "environment" { type = string }
variable "vpc_id" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "instance_class" { type = string }
variable "database_name" { type = string }
variable "master_password" {
  type      = string
  sensitive = true
  default   = "CHANGE_ME_IN_SECRETS"
}

output "endpoint" { value = aws_rds_cluster.main.endpoint }
output "reader_endpoint" { value = aws_rds_cluster.main.reader_endpoint }
