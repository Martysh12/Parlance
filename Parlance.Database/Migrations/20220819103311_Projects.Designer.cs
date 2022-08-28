﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using Parlance.Database;

#nullable disable

namespace Parlance.Database.Migrations
{
    [DbContext(typeof(ParlanceContext))]
    [Migration("20220819103311_Projects")]
    partial class Projects
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "6.0.8")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("Parlance.Database.Models.Project", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("SystemName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("VcsDirectory")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("Name")
                        .IsUnique();

                    b.ToTable("Projects", (string)null);
                });

            modelBuilder.Entity("Parlance.Database.Models.SshKey", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("SshKeyContents")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("SshPrivateKeyContents")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("SshKeys", (string)null);
                });

            modelBuilder.Entity("Parlance.Database.Models.SshTrustedServer", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.HasKey("Id");

                    b.ToTable("SshTrustedServers", (string)null);
                });

            modelBuilder.Entity("Parlance.Database.Models.Superuser", b =>
                {
                    b.Property<string>("Username")
                        .HasColumnType("text");

                    b.HasKey("Username");

                    b.ToTable("Superusers", (string)null);
                });
#pragma warning restore 612, 618
        }
    }
}
