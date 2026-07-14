using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Infrastructure.Migrations;

public partial class MoveSignupIncomeToIncomes : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "AVGIncome",
            table: "Users");

        migrationBuilder.AddColumn<string>(
            name: "Currency",
            table: "Users",
            type: "nvarchar(10)",
            maxLength: 10,
            nullable: false,
            defaultValue: "");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "Currency",
            table: "Users");

        migrationBuilder.AddColumn<int>(
            name: "AVGIncome",
            table: "Users",
            type: "int",
            nullable: false,
            defaultValue: 0);
    }
}
