using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBudgetTableForAllocations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "Budgets");

            migrationBuilder.RenameColumn(
                name: "StartDate",
                table: "Budgets",
                newName: "ExpectedDate");

            migrationBuilder.AddColumn<Guid>(
                name: "ExpenseId",
                table: "Budgets",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsSpent",
                table: "Budgets",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "SpentAt",
                table: "Budgets",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExpenseId",
                table: "Budgets");

            migrationBuilder.DropColumn(
                name: "IsSpent",
                table: "Budgets");

            migrationBuilder.DropColumn(
                name: "SpentAt",
                table: "Budgets");

            migrationBuilder.RenameColumn(
                name: "ExpectedDate",
                table: "Budgets",
                newName: "StartDate");

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "Budgets",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }
    }
}
