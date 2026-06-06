terraform {
  backend "gcs" {
    bucket = "cinemates-tf-state"
    prefix = "gks-addons"
  }
}
